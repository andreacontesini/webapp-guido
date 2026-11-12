import { test } from "node:test";
import assert from "node:assert/strict";

import { aBlocchi } from "./blocchi";

test("divide in blocchi della dimensione indicata", () => {
  assert.deepEqual(aBlocchi([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});

test("500 id diventano 5 blocchi da 100", () => {
  const blocchi = aBlocchi(Array.from({ length: 500 }, (_, i) => i), 100);
  assert.equal(blocchi.length, 5);
  assert.ok(blocchi.every((b) => b.length === 100));
});

test("elenco vuoto: nessun blocco", () => {
  assert.deepEqual(aBlocchi([], 100), []);
});
