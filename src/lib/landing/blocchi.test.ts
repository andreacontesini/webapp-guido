import { test } from "node:test";
import assert from "node:assert/strict";

import { haAcquisto, isLinkValido, normalizzaBarra, normalizzaBlocchi, pulsantiDi } from "./blocchi";

const heroVecchio = { id: "hero-1", tipo: "hero", titolo: "Vendi casa", sottotitolo: "Con metodo" };
const tappe = { id: "tappe-1", tipo: "tappe", titolo: "Cosa trovi", tappe: [{ titolo: "Uno", testo: "Primo" }] };

test("landing salvate prima dei pulsanti: stesso aspetto di prima", () => {
  const blocchi = normalizzaBlocchi([
    heroVecchio,
    tappe,
    { id: "invito-1", tipo: "invito", titolo: "Entra", azione: "accedi" },
    { id: "video-1", tipo: "video", indirizzo: "https://youtu.be/abcdefghijk", pulsanteAcquisto: true },
  ]);
  const [hero, , invito, video] = blocchi;
  assert.equal(hero.tipo, "hero");
  if (hero.tipo !== "hero") return;
  assert.equal(hero.media, "guida");
  assert.deepEqual(hero.pulsante, { etichetta: "Acquista la guida", azione: "acquista", stile: "principale" });
  assert.deepEqual(hero.pulsanteSecondario, {
    etichetta: "Scopri cosa contiene",
    azione: "sezione",
    sezione: "tappe-1",
    stile: "secondario",
  });
  assert.equal(invito.tipo === "invito" && invito.pulsante.azione, "accedi");
  assert.equal(video.tipo === "video" && video.pulsante?.azione, "acquista");
  assert.equal(haAcquisto(blocchi), true);
});

test("apertura senza tappe: nessun pulsante secondario", () => {
  const [hero] = normalizzaBlocchi([heroVecchio]);
  assert.equal(hero.tipo === "hero" && hero.pulsanteSecondario, undefined);
});

test("pulsanti: facoltativi solo se attivi, destinazione obbligatoria", () => {
  const blocchi = normalizzaBlocchi([
    { ...tappe, pulsante: { attivo: false, etichetta: "Vai", azione: "sezione", sezione: "x" } },
    { id: "t2", tipo: "testo", paragrafi: ["Ciao"], pulsante: { attivo: true, etichetta: "Vai", azione: "sezione", sezione: "" } },
    { id: "t3", tipo: "testo", paragrafi: ["Ciao"], pulsante: { attivo: true, etichetta: "Sito", azione: "link", link: "javascript:alert(1)" } },
    { id: "t4", tipo: "testo", paragrafi: ["Ciao"], pulsante: { attivo: true, etichetta: "Chiama", azione: "link", link: "tel:+39 340 1234567" } },
  ]);
  assert.deepEqual(
    pulsantiDi(blocchi).map((p) => p.etichetta),
    ["Chiama"],
  );
  assert.equal(haAcquisto(blocchi), false);
});

test("link ammessi: https, percorsi interni, mailto e tel", () => {
  assert.ok(isLinkValido("https://www.guidocontesini.it"));
  assert.ok(isLinkValido("/privacy"));
  assert.ok(isLinkValido("mailto:info@example.com"));
  assert.ok(!isLinkValido("http://esempio.it"));
  assert.ok(!isLinkValido("//esempio.it"));
  assert.ok(!isLinkValido("javascript:alert(1)"));
});

test("modulo: campi senza doppioni, almeno email o telefono, destinatari validi", () => {
  const [modulo] = normalizzaBlocchi([
    {
      id: "modulo-1",
      tipo: "modulo",
      campi: [
        { campo: "nome", etichetta: "", obbligatorio: true },
        { campo: "telefono", etichetta: "Il tuo numero", obbligatorio: true },
        { campo: "nome", etichetta: "Doppio", obbligatorio: false },
        { campo: "inventato", etichetta: "X" },
      ],
      destinatari: ["Guido@Example.com", "non-valida", "guido@example.com"],
    },
  ]);
  assert.equal(modulo.tipo, "modulo");
  if (modulo.tipo !== "modulo") return;
  assert.deepEqual(
    modulo.campi.map((c) => [c.campo, c.etichetta, c.obbligatorio]),
    [
      ["nome", "Nome e cognome", true],
      ["telefono", "Il tuo numero", true],
    ],
  );
  assert.deepEqual(modulo.destinatari, ["guido@example.com"]);
  assert.ok(modulo.etichettaInvio && modulo.messaggioConferma);

  const senzaRecapito = normalizzaBlocchi([{ id: "m2", tipo: "modulo", campi: [{ campo: "nome" }, { campo: "citta" }] }]);
  assert.equal(senzaRecapito.length, 0);
});

test("barra fissa: predefinita, spenta o personalizzata", () => {
  assert.deepEqual(normalizzaBarra(null), { modo: "predefinita" });
  assert.deepEqual(normalizzaBarra({ attiva: false }), { modo: "spenta" });
  assert.deepEqual(normalizzaBarra({ attiva: true, pulsante: { etichetta: "", azione: "acquista" } }), { modo: "spenta" });
  const barra = normalizzaBarra({
    attiva: true,
    titolo: "Consulenza gratuita",
    pulsante: { etichetta: "Prenota", azione: "sezione", sezione: "modulo-1", stile: "principale" },
  });
  assert.equal(barra.modo, "personalizzata");
  assert.equal(barra.modo === "personalizzata" && barra.pulsante.sezione, "modulo-1");
});
