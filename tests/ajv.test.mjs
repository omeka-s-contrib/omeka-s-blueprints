import { test } from "node:test";
import assert from "node:assert/strict";
import { createAjv } from "./ajv.mjs";

test("the annotation is a known keyword", () => {
  assert.doesNotThrow(() => createAjv().compile({ type: "string", "x-blueprint-reference": "resource" }));
});
test("an unknown annotation value fails", () => {
  assert.throws(() => createAjv().compile({ type: "string", "x-blueprint-reference": "adon" }));
});
test("an unknown keyword fails", () => {
  assert.throws(() => createAjv().compile({ type: "string", "x-blueprint-refrence": "resource" }), /unknown keyword/);
});
