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

test("un solo campo mancante: 99% e il campo è indicato per nome", () => {
  const profilo = {
    first_name: "Mario", last_name: "Rossi", phone: "333 1234567", residence_city: "Bergamo", residence_province: "BG",
    contact_preference: "telefono", contact_time: "mattina",
  } as const;
  const immobile = {
    city: "Bergamo", province: "BG", area: "Centro", street: "Via Roma 1", property_type: "appartamento", usage: null,
    surface_sqm: 90, rooms: 4, bedrooms: 2, bathrooms: 1, floor: 2, has_elevator: true, year_built: 1990, condition: "buono",
    energy_class: "C", has_garage: true, has_cellar: false, has_garden: false, has_terrace: true, heating: "autonomo", condo_fees_monthly: 80,
    ownership: "unico", inherited: false, mortgage: "nessuno", occupancy: "libero", compliance_doubts: "no", building_bonus_works: false,
    documents: tutteDoc,
    sale_timeline: "entro_6_mesi", sale_reason: "altro", linked_purchase: "no", expected_price: 250000, valuation_done: false, listed_before: "no",
  } as const;
  const incompleto = calcolaCompletamento(profilo, immobile);
  assert.equal(incompleto.percentuale, 99);
  assert.deepEqual(incompleto.sezioni.find((s) => s.id === "casa")?.mancanti, ["Uso attuale"]);

  const completo = calcolaCompletamento(profilo, { ...immobile, usage: "abitazione_principale" });
  assert.equal(completo.percentuale, 100);
  assert.ok(completo.sezioni.every((s) => s.completa && s.mancanti.length === 0));
});
