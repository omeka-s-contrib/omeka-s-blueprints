import { test } from "node:test";
import assert from "node:assert/strict";
import { createAjv, main } from "./ajv.mjs";

test("the annotation is a known keyword", () => {
  assert.doesNotThrow(() => createAjv().compile({ type: "string", "x-blueprint-reference": "resource" }));
});
test("an unknown annotation value fails", () => {
  assert.throws(
    () => createAjv().compile({ type: "string", "x-blueprint-reference": "adon" }),
    /x-blueprint-reference.*allowed values/,
  );
});
test("an unknown keyword fails", () => {
  assert.throws(() => createAjv().compile({ type: "string", "x-blueprint-refrence": "resource" }), /unknown keyword/);
});

// Strict mode skips unknown keywords next to a $ref, where both annotations sit,
// so a misspelt annotation key there would compile silently.
const METADATA = new Set(["$comment", "title", "description", "default", "deprecated", "examples"]);
test("every key next to a $ref is a known keyword", () => {
  const ajv = createAjv();
  const unknown = [];
  (function walk(node) {
    if (!node || typeof node !== "object") return;
    if (typeof node.$ref === "string") {
      for (const key of Object.keys(node)) {
        if (!METADATA.has(key) && !ajv.getKeyword(key)) unknown.push(key);
      }
    }
    for (const value of Object.values(node)) walk(value);
  })(main);
  assert.deepEqual(unknown, []);
});
