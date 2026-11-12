import { test } from "node:test";
import assert from "node:assert/strict";

import { riepilogoProfilo } from "./riepilogo";

const profilo = { first_name: "Mario", last_name: "Rossi" };

test("le domande non pertinenti non compaiono", () => {
  const gruppi = riepilogoProfilo(profilo, { ownership: "unico", owners_count: null, documents: {} });
  const situazione = gruppi.find((g) => g.titolo === "Situazione e documenti")!;
  assert.ok(situazione.righe.some((r) => r.etichetta === "Proprietà" && r.valore === "Sono l'unico proprietario"));
  assert.ok(!situazione.righe.some((r) => r.etichetta === "Quanti proprietari?"));
});

test("le domande pertinenti compaiono anche se vuote", () => {
  const gruppi = riepilogoProfilo(profilo, { ownership: "cointestato", documents: {} });
  const riga = gruppi.find((g) => g.titolo === "Situazione e documenti")!.righe.find((r) => r.etichetta === "Quanti proprietari?");
  assert.ok(riga);
  assert.equal(riga.valore, null);
});

test("senza immobile le sezioni della casa ci sono, vuote", () => {
  const gruppi = riepilogoProfilo(profilo, null);
  const casa = gruppi.find((g) => g.titolo === "La tua casa")!;
  assert.ok(casa.righe.length > 0);
  assert.ok(casa.righe.every((r) => r.valore === null));
});
