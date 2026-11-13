import { test } from "node:test";
import assert from "node:assert/strict";
import { createAjv, main } from "./ajv.mjs";

const ajv = createAjv();
const def = (name) => ajv.getSchema(`${main.$id}#/$defs/${name}`);

const FORMS = ["relativePath", "url", "gitRepoUrl", "gitRepoShorthand", "gitRepoFile"];
const CASES = {
  "https://github.com/owner/repo": "gitRepoUrl",
  "https://github.com/owner/repo/": "gitRepoUrl",
  "https://github.com/owner/repo#v1.3.1": "gitRepoUrl",
  "https://github.com/owner/repo/#v1.3.1": "gitRepoUrl",
  "https://github.com/owner/repo.git": "gitRepoUrl",
  "https://github.com/owner/repo.git#v1.3.1": "gitRepoUrl",
  "https://gitlab.com/group/repo.git": "gitRepoUrl",
  "git@github.com:owner/repo.git": "gitRepoUrl",
  "git@github.com:owner/repo.git#main": "gitRepoUrl",
  "gh:owner/repo": "gitRepoShorthand",
  "gh:owner/repo#v1.3.1": "gitRepoShorthand",
  "gh:owner/repo@v1:dist/Module.zip": "gitRepoFile",
  "gh:owner/repo:config/a.php": "gitRepoFile",
  "gl:group/sub/repo@v1:config/b.php": "gitRepoFile",
  "https://github.com/owner/repo/archive/refs/tags/v1.3.1.zip": "url",
  "https://github.com/owner/repo/releases/download/v1.3.1/Repo-1.3.1.zip": "url",
  "https://github.com/owner/repo/tree/main": "url",
  "https://github.com/owner/repo/blob/main/README.md": "url",
  "https://github.com/owner": "url",
  "https://example.org/Module-1.2.3.zip": "url",
  "https://example.org/dl?id=5#frag": "url",
  "http://github.com/owner/repo": "url",
  "https://www.github.com/owner/repo": "url",
  "./modules/Module-1.2.3.zip": "relativePath",
  "modules/Module-1.2.3.zip": "relativePath",
  "../shared/Module.zip": "relativePath",
  ".\\zips\\M.zip": "relativePath",
  "/tmp/Module.zip": null,
  "\\\\server\\share\\M.zip": null,
  "C:\\M.zip": null,
  "file:///tmp/Module.zip": null,
  "php://input": null,
  "HTTPS://example.org/M.zip": null,
  "gh:owner": null,
  "gl:group/repo": null,
  "": null,
};

for (const [value, expected] of Object.entries(CASES)) {
  test(`form of ${JSON.stringify(value)} is ${expected}`, () => {
    const matched = FORMS.filter((form) => def(`datasource.${form}`)(value));
    assert.deepEqual(matched, expected ? [expected] : []);
  });
}

test("datasource.file accepts a path, a URL and a repository file", () => {
  const file = def("datasource.file");
  for (const v of ["./a.php", "https://example.org/a.php", "gh:o/r:a.php"]) assert.equal(file(v), true, v);
  assert.equal(file("gh:o/r"), false);
});

test("omeka.addonSource accepts a ZIP path, a repository URL and a shorthand", () => {
  const addon = def("omeka.addonSource");
  for (const v of ["./M.zip", "https://github.com/o/r", "gh:o/r#v1"]) assert.equal(addon(v), true, v);
  assert.equal(addon("/M.zip"), false);
});
