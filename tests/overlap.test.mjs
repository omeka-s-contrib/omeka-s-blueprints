import { test } from "node:test";
import assert from "node:assert/strict";
import { createAjv, main } from "./ajv.mjs";

const ajv = createAjv();
const FORMS = ["relativePath", "url", "git"].map((f) => ajv.getSchema(`${main.$id}#/$defs/datasource.${f}`));

const PIECES = ["", "https://", "HTTPS://", "http://", "git@", "gh:", "gl:", "github.com/", "example.org", "/", "./", "../",
  ".git", "#", "@", ":", "o", "r", "..", "\\", "C:", " "];

// Every concatenation of `depth` pieces that matches two or more forms.
function overlaps(pieces, depth) {
  const found = new Set();
  const visit = (prefix, left) => {
    if (left === 0) {
      if (FORMS.filter((form) => form(prefix)).length > 1) found.add(prefix);
      return;
    }
    for (const piece of pieces) visit(prefix + piece, left - 1);
  };
  visit("", depth);
  return [...found];
}

test("no value matches two data source forms", () => {
  assert.deepEqual(overlaps(PIECES, 4), []);
});
