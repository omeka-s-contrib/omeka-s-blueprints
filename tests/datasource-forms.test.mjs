import { test } from "node:test";
import assert from "node:assert/strict";
import { createAjv, main } from "./ajv.mjs";

const ajv = createAjv();
const def = (name) => ajv.getSchema(`${main.$id}#/$defs/${name}`);

const FORMS = ["relativePath", "url", "git"];
const CASES = {
  "https://example.org/M.zip": "url", "HTTPS://example.org/M.zip": "url", "http://example.org/a.php": "url",
  "https://github.com/owner/repo": "url", "https://gitlab.com/o/r.git#v1": "url",
  "https://github.com/o/r/releases/download/v1/M.zip": "url",
  "https://": null, "http:///x.zip": null,
  "gh:owner/repo": "git", "gh:owner/repo#v1": "git", "gh:owner/repo@v1:dist/M.zip": "git",
  "gl:group/sub/repo@v1:config/a.php": "git", "git@github.com:owner/repo.git#main": "git", "gh:owner": "git",
  "./config/a.php": "relativePath", "config/a.php": "relativePath", "../shared/a.php": "relativePath",
  "a/../b.php": "relativePath", ".\\zips\\M.zip": "relativePath", "./My%20File.pdf": "relativePath",
  "caf\u00e9.jpg": "relativePath", "./10:00.json": "relativePath", "10:00.json": "relativePath", "a:b.json": null, "git@foo/bar": "relativePath", "Mapping": "relativePath",
  "/etc/a.php": null, "\\\\server\\share\\a.php": null, "C:\\a.php": null, "C:/a.php": null,
  "file:///tmp/a.php": null, "php://input": null, "ftp://example.org/a.zip": null, "mailto:a@example.org": null,
  "deploy@gitlab.example.org:o/r.git": "relativePath", "CleanUrl:3.4": null, "git@:x": "git", "": null,
  " https://example.org/M.zip": null, " ./a.zip": null, "\ta.zip": null, "\u00a0a.zip": null, "./a.zip ": "relativePath",
};

for (const [value, expected] of Object.entries(CASES)) {
  test(`form of ${JSON.stringify(value)} is ${expected}`, () => {
    const matched = FORMS.filter((form) => def(`datasource.${form}`)(value));
    assert.deepEqual(matched, expected ? [expected] : []);
  });
}

test("datasource.file and omeka.addonSource accept the same three forms", () => {
  for (const name of ["datasource.file", "omeka.addonSource"]) {
    for (const v of ["./a.zip", "https://example.org/a.zip", "gh:o/r@v1:a.zip", "gh:o/r"]) assert.equal(def(name)(v), true, `${name} ${v}`);
    assert.equal(def(name)("/a.zip"), false, name);
  }
});

test("the forms carry no annotation; the field types reference datasource.source", () => {
  for (const f of FORMS) assert.equal("x-blueprint-reference" in main.$defs[`datasource.${f}`], false, f);
  assert.equal(main.$defs["datasource.file"].$ref, "#/$defs/datasource.source");
  assert.equal(main.$defs["omeka.addonSource"].$ref, "#/$defs/datasource.source");
});

test("addonSource is a deprecated alias of omeka.addonSource", () => {
  assert.deepEqual(
    { $ref: main.$defs.addonSource.$ref, deprecated: main.$defs.addonSource.deprecated },
    { $ref: "#/$defs/omeka.addonSource", deprecated: true },
  );
  const alias = def("addonSource");
  for (const v of ["./M.zip", "gh:o/r#v1"]) assert.equal(alias(v), true, v);
  assert.equal(alias("/M.zip"), false);
});
