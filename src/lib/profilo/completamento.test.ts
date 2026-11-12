import { test } from "node:test";
import assert from "node:assert/strict";

import { calcolaCompletamento } from "./completamento";

const tutteDoc = { atto_provenienza: "si", planimetria: "si", visura: "no", ape: "non_so", agibilita: "si", spese_condominiali: "si" } as const;

test("profilo vuoto senza immobile: solo nome e cognome contano", () => {
  const { percentuale, sezioni } = calcolaCompletamento({ first_name: "Mario", last_name: "Rossi" }, null);
  assert.ok(percentuale > 0 && percentuale < 15);
  assert.equal(sezioni.length, 4); // le note non contano
  assert.ok(sezioni.every((s) => !s.completa));
});

test("le condizionali non applicabili non contano", () => {
  const immobile = {
    ownership: "unico", inherited: false, mortgage: "nessuno", occupancy: "libero",
    compliance_doubts: "no", building_bonus_works: false, documents: tutteDoc,
  };
  const { sezioni } = calcolaCompletamento({}, immobile);
  assert.equal(sezioni.find((s) => s.id === "situazione")?.completa, true);
});

test("le condizionali applicabili vuote rendono incompleta la sezione", () => {
  const immobile = {
    ownership: "cointestato", inherited: false, mortgage: "nessuno", occupancy: "libero",
    compliance_doubts: "no", building_bonus_works: false, documents: tutteDoc,
  };
  assert.equal(calcolaCompletamento({}, immobile).sezioni.find((s) => s.id === "situazione")?.completa, false);
});

test("documenti completi solo con tutte le risposte", () => {
  const base = { ownership: "unico", inherited: false, mortgage: "nessuno", occupancy: "libero", compliance_doubts: "no", building_bonus_works: false };
  assert.equal(calcolaCompletamento({}, { ...base, documents: { ape: "si" } }).sezioni.find((s) => s.id === "situazione")?.completa, false);
});

test("false conta come risposta", () => {
  const { sezioni } = calcolaCompletamento({}, { valuation_done: false, sale_timeline: "entro_3_mesi", sale_reason: "altro", linked_purchase: "no", expected_price: 200000, listed_before: "no" });
  assert.equal(sezioni.find((s) => s.id === "obiettivi")?.completa, true);
});
