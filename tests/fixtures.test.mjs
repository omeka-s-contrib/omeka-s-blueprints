// Validates every fixture against the schema:
//   fixtures/valid/*.json                  must pass blueprint-schema.json
//   fixtures/valid/partials/<name>/*.json  must pass partials/<name>.schema.json
//   fixtures/invalid/...                   same layout, must fail
//   docs/examples/*.json                   must pass blueprint-schema.json
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { validatorFor, errorsText } from "./ajv.mjs";

const root = new URL("..", import.meta.url).pathname;
const schemaDir = join(root, "assets/schema");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

function* fixtures(kind) {
  const dir = join(root, "fixtures", kind);
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    yield { path: join(kind, file), file: join(dir, file) };
  }
  const partialsDir = join(dir, "partials");
  if (!existsSync(partialsDir)) return;
  for (const partial of readdirSync(partialsDir)) {
    for (const file of readdirSync(join(partialsDir, partial))) {
      yield { path: join(kind, "partials", partial, file), file: join(partialsDir, partial, file), partial };
    }
  }
}

test("all schemas compile", () => {
  assert.ok(validatorFor());
  for (const file of readdirSync(join(schemaDir, "partials"))) {
    assert.ok(validatorFor(file.replace(".schema.json", "")), file);
  }
});

for (const { path, file, partial } of fixtures("valid")) {
  test(`valid: ${path}`, () => {
    const validate = validatorFor(partial);
    assert.ok(validate(readJson(file)), errorsText(validate.errors));
  });
}

for (const file of readdirSync(join(root, "docs/examples"))) {
  test(`example: docs/examples/${file}`, () => {
    const validate = validatorFor();
    assert.ok(validate(readJson(join(root, "docs/examples", file))), errorsText(validate.errors));
  });
}

for (const { path, file, partial } of fixtures("invalid")) {
  test(`invalid: ${path}`, () => {
    assert.equal(validatorFor(partial)(readJson(file)), false, "expected validation to fail");
  });
}
