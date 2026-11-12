import { test } from "node:test";
import assert from "node:assert/strict";

import { datiEsportati, isConfermaEliminazione } from "./account";

test("conferma: solo la parola ELIMINA, anche in minuscolo e con spazi", () => {
  assert.equal(isConfermaEliminazione("ELIMINA"), true);
  assert.equal(isConfermaEliminazione("  elimina "), true);
  assert.equal(isConfermaEliminazione("elimin"), false);
  assert.equal(isConfermaEliminazione(""), false);
  assert.equal(isConfermaEliminazione(null), false);
});

const profilo = {
  id: "u1", email: "mario@example.com", first_name: "Mario", last_name: "Rossi", phone: null,
  role: "cliente", is_blocked: false, guide_access: true, privacy_accepted_at: "2026-11-12T10:00:00Z",
  marketing_consent: false, onboarded_at: "2026-11-12T10:00:00Z", current_session_id: "sessione-segreta",
  residence_city: "Brescia", residence_province: null, contact_preference: null, contact_time: null,
  created_at: "2026-11-12T10:00:00Z", updated_at: "2026-11-12T10:00:00Z",
} as const;

test("esportazione: dati personali, immobile e acquisti, senza dati tecnici interni", () => {
  const dati = datiEsportati(
    profilo,
    { id: "p1", user_id: "u1", city: "Brescia", notes: "Nota", documents: { ape: "si" } },
    [{ product: "guida", status: "pagato", amount_total: 8900, currency: "eur", paid_at: "2026-11-12T10:00:00Z", created_at: "2026-11-12T10:00:00Z" }],
  );
  assert.equal(dati.account.email, "mario@example.com");
  assert.equal(dati.account.nome, "Mario");
  assert.equal(dati.immobile?.comune, "Brescia");
  assert.equal(dati.immobile?.note, "Nota");
  assert.equal(dati.acquisti.length, 1);
  const json = JSON.stringify(dati);
  assert.ok(!json.includes("sessione-segreta"), "l'id della sessione non va esportato");
  assert.ok(!json.includes('"u1"') && !json.includes('"p1"'), "gli id interni non vanno esportati");
  assert.ok(dati.esportatoIl);
});

test("esportazione senza immobile", () => {
  assert.equal(datiEsportati(profilo, null, []).immobile, null);
});
