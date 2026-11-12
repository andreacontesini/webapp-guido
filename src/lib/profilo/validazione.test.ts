import { test } from "node:test";
import assert from "node:assert/strict";

import { sezionePerId } from "./campi";
import { unisciInviati, validaSezione } from "./validazione";

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

test("il punto vale come separatore delle migliaia solo nel formato giusto", () => {
  const casa = validaSezione(sezione("casa"), modulo({ surface_sqm: "85.5", rooms: "1.5" }));
  assert.ok(casa.errori.surface_sqm, "85.5 non deve diventare 855");
  assert.ok(casa.errori.rooms, "1.5 non deve diventare 15");
  const prezzo = validaSezione(sezione("obiettivi"), modulo({ expected_price: "1.200.000" }));
  assert.equal(prezzo.valori.expected_price, 1200000);
});

test("nome di un solo carattere: messaggio sulla lunghezza", () => {
  const { errori } = validaSezione(sezione("personali"), modulo({ first_name: "A", last_name: "" }));
  assert.equal(errori.first_name, "Almeno 2 caratteri.");
  assert.equal(errori.last_name, "Inserisci cognome.");
});

test("unità m2 e mq accettate", () => {
  const { valori, errori } = validaSezione(sezione("casa"), modulo({ surface_sqm: "85 m2", condo_fees_monthly: "90" }));
  assert.deepEqual(errori, {});
  assert.equal(valori.surface_sqm, 85);
  assert.equal(validaSezione(sezione("casa"), modulo({ surface_sqm: "120mq" })).valori.surface_sqm, 120);
});

test("decimali con virgola o punto: messaggio specifico", () => {
  assert.equal(validaSezione(sezione("casa"), modulo({ surface_sqm: "85,5" })).errori.surface_sqm, "Senza decimali: arrotonda all'intero.");
  assert.equal(validaSezione(sezione("casa"), modulo({ surface_sqm: "85.5" })).errori.surface_sqm, "Senza decimali: arrotonda all'intero.");
});

test("dopo un errore i valori nascosti già scritti restano", () => {
  const precedenti = { ownership: "unico", owners_count: "3", owners_agree: "si", inherited: "" };
  const inviati = { ownership: "unico", owners_count: "", owners_agree: "", inherited: "si" };
  const uniti = unisciInviati(sezione("situazione"), precedenti, inviati);
  assert.equal(uniti.owners_count, "3");
  assert.equal(uniti.owners_agree, "si");
  assert.equal(uniti.inherited, "si");
});

test("dopo un errore i campi visibili prendono il valore inviato, anche vuoto", () => {
  const uniti = unisciInviati(sezione("casa"), { city: "Brescia" }, { city: "" });
  assert.equal(uniti.city, "");
});
