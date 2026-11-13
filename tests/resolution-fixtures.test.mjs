// Checks that fixtures/resolution/<case>/ are well-formed: blueprint.json and every imported
// list pass the schema, and expected.json is in the documented format and points at real strings.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { validatorFor, errorsText } from "./ajv.mjs";

const root = new URL("..", import.meta.url).pathname;
const resolutionDir = join(root, "fixtures/resolution");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const cases = existsSync(resolutionDir)
  ? readdirSync(resolutionDir).filter((d) => statSync(join(resolutionDir, d)).isDirectory())
  : [];

const walkFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walkFiles(join(dir, e.name)) : [join(dir, e.name)],
  );

// Follows $import entries from blueprint.json; returns Map(file -> list key it is imported under).
function importedLists(caseDir) {
  const found = new Map();
  const visit = (list, key, baseDir) => {
    for (const entry of list) {
      if (!entry || typeof entry !== "object" || typeof entry.$import !== "string") continue;
      const file = resolve(baseDir, entry.$import);
      found.set(file, key);
      const nested = readJson(file);
      assert.ok(Array.isArray(nested), `${file} must be a JSON array`);
      visit(nested, key, dirname(file));
    }
  };
  const blueprint = readJson(join(caseDir, "blueprint.json"));
  for (const [key, value] of Object.entries(blueprint)) {
    if (Array.isArray(value)) visit(value, key, caseDir);
  }
  return found;
}

const resolvePointer = (doc, pointer) =>
  pointer === ""
    ? doc
    : pointer
        .split("/")
        .slice(1)
        .map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"))
        .reduce((node, token) => (node == null ? undefined : node[token]), doc);

test("at least 4 resolution cases", () => {
  assert.ok(cases.length >= 4, `found ${cases.length}`);
});

for (const name of cases) {
  const caseDir = join(resolutionDir, name);

  test(`resolution/${name}: blueprint and imported lists are valid`, () => {
    const validate = validatorFor();
    assert.ok(validate(readJson(join(caseDir, "blueprint.json"))), errorsText(validate.errors));
    const imports = importedLists(caseDir);
    for (const [file, key] of imports) {
      const data = readJson(file);
      // Lists without a partial (e.g. items) are checked inside the main schema instead.
      const validatePartial = validatorFor(key) ?? validate;
      const subject = validatorFor(key) ? data : { [key]: data };
      assert.ok(validatePartial(subject), `${relative(caseDir, file)}\n${errorsText(validatePartial.errors)}`);
    }
    const reached = new Set([join(caseDir, "blueprint.json"), join(caseDir, "expected.json"), ...imports.keys()]);
    for (const file of walkFiles(caseDir).filter((f) => f.endsWith(".json"))) {
      assert.ok(reached.has(file), `${relative(caseDir, file)} is not imported`);
    }
  });

  test(`resolution/${name}: expected.json`, () => {
    const expected = readJson(join(caseDir, "expected.json"));
    assert.ok(Array.isArray(expected) && expected.length > 0);
    for (const entry of expected) {
      assert.deepEqual(Object.keys(entry).sort(), ["in", "pointer", "resolved"]);
      const file = join(caseDir, entry.in);
      assert.ok(existsSync(file), `${entry.in} exists`);
      assert.equal(typeof resolvePointer(readJson(file), entry.pointer), "string", `${entry.in}${entry.pointer}`);
      const r = entry.resolved;
      const keys = Object.keys(r).sort().join();
      if (keys === "path") assert.ok(typeof r.path === "string" && !r.path.startsWith("./") && !r.path.startsWith("/"));
      else if (keys === "url") assert.match(r.url, /^https?:\/\//);
      else if (keys === "ref,repository") {
        assert.match(r.repository, /^github\.com\/[^/]+\/[^/]+$/);
        assert.ok(r.ref === null || typeof r.ref === "string");
      } else if (keys === "error") assert.equal(r.error, "outside-root");
      else assert.fail(`unknown resolved form ${keys}`);
    }
  });
}
