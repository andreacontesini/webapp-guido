import { test } from "node:test";
import assert from "node:assert/strict";

import { statoRichiesta, validaRicontatto } from "./ricontatto";

const modulo = (valori: Record<string, string>) => {
  const dati = new FormData();
  for (const [chiave, valore] of Object.entries(valori)) dati.set(chiave, valore);
  return dati;
};

test("richiesta valida con email: il telefono non serve", () => {
  const esito = validaRicontatto(modulo({ contatto: "email", orario: "", note: "  Vorrei una valutazione  " }));
  assert.ok("dati" in esito);
  assert.deepEqual(esito.dati, {
    contact_request_notes: "Vorrei una valutazione",
    contact_preference: "email",
    contact_time: null,
    phone: null,
  });
});

test("telefono o WhatsApp richiedono il numero", () => {
  const esito = validaRicontatto(modulo({ contatto: "whatsapp", telefono: "" }));
  assert.ok("errori" in esito);
  assert.match(esito.errori.telefono ?? "", /numero/);

  const ok = validaRicontatto(modulo({ contatto: "telefono", telefono: "+39 333 123 4567", orario: "sera" }));
  assert.ok("dati" in ok);
  assert.equal(ok.dati.phone, "+39 333 123 4567");
  assert.equal(ok.dati.contact_time, "sera");
});

test("valori non ammessi e note troppo lunghe", () => {
  const esito = validaRicontatto(modulo({ contatto: "piccione", orario: "notte", note: "x".repeat(1001), telefono: "abc" }));
  assert.ok("errori" in esito);
  assert.ok(esito.errori.contatto);
  assert.ok(esito.errori.orario);
  assert.ok(esito.errori.note);
  assert.ok(esito.errori.telefono);
  assert.equal(esito.valori.contatto, "piccione");
});

test("stato della richiesta", () => {
  assert.equal(statoRichiesta({ contact_request_at: null, contact_request_handled_at: null }), "nessuna");
  assert.equal(
    statoRichiesta({ contact_request_at: "2026-11-13T10:00:00Z", contact_request_handled_at: null }),
    "in_attesa",
  );
  assert.equal(
    statoRichiesta({ contact_request_at: "2026-11-13T10:00:00Z", contact_request_handled_at: "2026-11-13T12:00:00Z" }),
    "gestita",
  );
  // Nuova richiesta dopo una gestita: torna in attesa.
  assert.equal(
    statoRichiesta({ contact_request_at: "2026-11-14T10:00:00Z", contact_request_handled_at: "2026-11-13T12:00:00Z" }),
    "in_attesa",
  );
});
