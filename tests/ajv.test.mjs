import { test } from "node:test";
import assert from "node:assert/strict";
import { createAjv } from "./ajv.mjs";

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
// so a misspelt annotation key would compile silently.
test("no misspelt annotation key anywhere in the schema", async () => {
  const { main } = await import("./ajv.mjs");
  const keys = [];
  (function walk(node) {
    if (!node || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node)) {
      if (/^x-blueprint/i.test(key) && key !== "x-blueprint-reference") keys.push(key);
      walk(value);
    }
  })(main);
  assert.deepEqual(keys, []);
});
