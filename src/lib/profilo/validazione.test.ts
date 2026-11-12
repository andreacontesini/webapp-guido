import { test } from "node:test";
import assert from "node:assert/strict";

import { sezionePerId } from "./campi";
import { validaSezione } from "./validazione";

const modulo = (dati: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(dati)) fd.set(k, v);
  return fd;
};
const sezione = (id: string) => sezionePerId(id)!;

test("dati personali: nome e cognome obbligatori", () => {
  const { errori } = validaSezione(sezione("personali"), modulo({ first_name: "", last_name: "R" }));
  assert.ok(errori.first_name);
  assert.ok(errori.last_name);
});

test("dati personali validi, campi vuoti diventano null", () => {
  const { valori, errori } = validaSezione(
    sezione("personali"),
    modulo({ first_name: " Mario ", last_name: "Rossi", phone: "", contact_preference: "whatsapp", contact_time: "" }),
  );
  assert.deepEqual(errori, {});
  assert.equal(valori.first_name, "Mario");
  assert.equal(valori.phone, null);
  assert.equal(valori.contact_preference, "whatsapp");
  assert.equal(valori.contact_time, null);
});

test("scelta fuori elenco è un errore", () => {
  const { errori } = validaSezione(sezione("casa"), modulo({ property_type: "castello" }));
  assert.ok(errori.property_type);
});

test("numeri all'italiana accettati", () => {
  const { valori, errori } = validaSezione(
    sezione("obiettivi"),
    modulo({ expected_price: "250.000", sale_timeline: "entro_6_mesi" }),
  );
  assert.deepEqual(errori, {});
  assert.equal(valori.expected_price, 250000);
  const casa = validaSezione(sezione("casa"), modulo({ surface_sqm: "1 200", condo_fees_monthly: "85 €" }));
  assert.equal(casa.valori.surface_sqm, 1200);
  assert.equal(casa.valori.condo_fees_monthly, 85);
});

test("numeri fuori intervallo o non interi sono errori", () => {
  const { errori } = validaSezione(sezione("casa"), modulo({ surface_sqm: "5", rooms: "2,5" }));
  assert.ok(errori.surface_sqm);
  assert.ok(errori.rooms);
});

test("sì/no: si, no e vuoto", () => {
  const { valori } = validaSezione(sezione("casa"), modulo({ has_elevator: "si", has_garage: "no", has_cellar: "" }));
  assert.equal(valori.has_elevator, true);
  assert.equal(valori.has_garage, false);
  assert.equal(valori.has_cellar, null);
});

test("domande condizionali azzerate se la condizione non vale", () => {
  const { valori } = validaSezione(
    sezione("situazione"),
    modulo({ ownership: "unico", owners_count: "3", owners_agree: "si", inherited: "no", succession_done: "si", occupancy: "libero", lease_end: "2027-01-31" }),
  );
  assert.equal(valori.owners_count, null);
  assert.equal(valori.owners_agree, null);
  assert.equal(valori.succession_done, null);
  assert.equal(valori.lease_end, null);
});

test("domande condizionali salvate se la condizione vale", () => {
  const { valori, errori } = validaSezione(
    sezione("situazione"),
    modulo({ ownership: "cointestato", owners_count: "3", occupancy: "affittato", lease_end: "2027-01-31" }),
  );
  assert.deepEqual(errori, {});
  assert.equal(valori.owners_count, 3);
  assert.equal(valori.lease_end, "2027-01-31");
});

test("data non valida è un errore", () => {
  const { errori } = validaSezione(sezione("situazione"), modulo({ occupancy: "affittato", lease_end: "2027-02-31" }));
  assert.ok(errori.lease_end);
});

test("documenti: solo risposte valide, le vuote non salvate", () => {
  const { valori, errori } = validaSezione(
    sezione("situazione"),
    modulo({ "documents.ape": "si", "documents.visura": "non_so", "documents.planimetria": "" }),
  );
  assert.deepEqual(errori, {});
  assert.deepEqual(valori.documents, { ape: "si", visura: "non_so" });
  assert.ok(validaSezione(sezione("situazione"), modulo({ "documents.ape": "forse" })).errori.documents);
});

test("testo oltre il limite è un errore, a capo conservati nelle note", () => {
  assert.ok(validaSezione(sezione("note"), modulo({ notes: "x".repeat(2001) })).errori.notes);
  assert.equal(validaSezione(sezione("note"), modulo({ notes: "riga 1\nriga 2" })).valori.notes, "riga 1\nriga 2");
});

test("i valori inviati tornano indietro per ricompilare il modulo", () => {
  const { inviati } = validaSezione(sezione("casa"), modulo({ surface_sqm: "abc", city: "Brescia" }));
  assert.equal(inviati.surface_sqm, "abc");
  assert.equal(inviati.city, "Brescia");
});
