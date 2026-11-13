import { test } from "node:test";
import assert from "node:assert/strict";

import {
  chiaveDeduplica,
  codiciEvento,
  contenutoNotifica,
  eventi,
  normalizzaEventi,
  type DatiEvento,
} from "./eventi";

const cliente = { id: "u1", email: "mario@example.com", nome: "Mario Rossi" };

test("ogni evento del catalogo ha etichetta e gruppo", () => {
  for (const codice of codiciEvento) {
    assert.ok(eventi[codice].etichetta);
    assert.ok(eventi[codice].gruppo);
  }
});

test("gli eventi scelti tengono solo codici validi, senza doppioni", () => {
  assert.deepEqual(normalizzaEventi(["rimborso", "acquisto", "inventato", "acquisto", 3]), ["acquisto", "rimborso"]);
  assert.deepEqual(normalizzaEventi(null), []);
  assert.deepEqual(normalizzaEventi({ acquisto: true }), []);
});

test("chiavi di deduplica stabili per evento", () => {
  const acquisto: DatiEvento = {
    evento: "acquisto",
    cliente,
    prodotto: "guida",
    importoCentesimi: 8900,
    sessione: "cs_test_1",
    senzaAccount: false,
  };
  assert.equal(chiaveDeduplica(acquisto), "acquisto:cs_test_1");
  assert.equal(
    chiaveDeduplica({ evento: "profilo_aggiornato", cliente, sezione: "La tua casa", percentuale: 40, giorno: "2026-11-13" }),
    "profilo_aggiornato:u1:2026-11-13",
  );
  assert.equal(
    chiaveDeduplica({ evento: "richiesta_gdpr", cliente, tipo: "scaricamento", il: "2026-11-13T10:15:42.123Z" }),
    "richiesta_gdpr:scaricamento:u1:2026-11-13T10:15",
  );
  assert.ok(
    chiaveDeduplica({ evento: "problema_tecnico", problema: "x", dettaglio: "y", chiave: "z".repeat(500) }).length <= 200,
  );
});

test("acquisto: importo, prodotto e landing nelle righe", () => {
  const contenuto = contenutoNotifica({
    evento: "acquisto",
    cliente,
    prodotto: "guida",
    importoCentesimi: 8900,
    sessione: "cs_test_1",
    landing: "guida-vendere-casa-da-privato",
    senzaAccount: true,
  });
  assert.match(contenuto.oggetto, /guida/);
  assert.match(contenuto.oggetto, /89/);
  const valori = Object.fromEntries(contenuto.righe.map((r) => [r.etichetta, r.valore]));
  assert.equal(valori.Cliente, "Mario Rossi (mario@example.com)");
  assert.match(valori.Provenienza, /guida-vendere-casa-da-privato/);
  assert.equal(valori["Modalità"], "Acquisto senza account");
  assert.equal(contenuto.urgente, false);
});

test("contestazione aperta: urgente, con scadenza e link a Stripe", () => {
  const contenuto = contenutoNotifica({
    evento: "contestazione_aperta",
    cliente: { email: "a@b.it" },
    prodotto: "guida",
    importoCentesimi: 8900,
    contestazione: "dp_123",
    motivo: "product_not_received",
    scadenza: "2026-11-20T23:59:59Z",
  });
  assert.equal(contenuto.urgente, true);
  assert.match(contenuto.oggetto, /^\[Urgente\] /);
  assert.match(contenuto.avviso ?? "", /Scadenza/);
  assert.match(contenuto.pulsante?.href ?? "", /disputes\/dp_123$/);
  assert.ok(contenuto.righe.some((r) => r.valore === "product not received"));
});

test("ricontatto: preferenze tradotte e righe vuote omesse", () => {
  const contenuto = contenutoNotifica({
    evento: "richiesta_ricontatto",
    cliente,
    telefono: null,
    contatto: "whatsapp",
    orario: "sera",
    note: "Meglio dopo le 19",
    inviataIl: "2026-11-13T18:00:00Z",
  });
  const etichette = contenuto.righe.map((r) => r.etichetta);
  assert.ok(!etichette.includes("Telefono"));
  assert.ok(contenuto.righe.some((r) => r.valore === "WhatsApp"));
  assert.ok(contenuto.righe.some((r) => r.valore === "Sera"));
  assert.equal(contenuto.urgente, true);
});

test("ogni evento produce oggetto, titolo e almeno una riga", () => {
  const campioni: DatiEvento[] = [
    { evento: "nuovo_account", cliente, origine: "registrazione" },
    { evento: "primo_accesso", cliente, telefono: "333", marketing: true },
    { evento: "pagamento_in_attesa", cliente, prodotto: "guida", importoCentesimi: 8900, sessione: "cs", esito: "non_riuscito" },
    { evento: "rimborso", cliente, prodotto: "guida", importoCentesimi: 8900, pagamento: "pi" },
    { evento: "contestazione_chiusa", cliente, prodotto: "guida", contestazione: "dp", vinta: false },
    { evento: "richiesta_gdpr", cliente, tipo: "eliminazione", il: "2026-11-13T10:00:00Z" },
    { evento: "problema_tecnico", problema: "Email non partita", dettaglio: "timeout", chiave: "k" },
  ];
  for (const dati of campioni) {
    const contenuto = contenutoNotifica(dati);
    assert.ok(contenuto.oggetto.length > 5 && contenuto.oggetto.length <= 200, dati.evento);
    assert.ok(contenuto.titolo, dati.evento);
    assert.ok(contenuto.righe.length > 0, dati.evento);
  }
});
