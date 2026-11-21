# Resolution fixtures

The schema cannot check how sources resolve. Each case folder holds a `blueprint.json`, the files it
imports, and an `expected.json` for consumers to test their resolvers against. The results are the
same whether the blueprint is read from disk or loaded from a URL.

The root is the folder of `blueprint.json`. A file imported by an absolute URL or by `gh:`/`gl:` has
its own folder as root; a file imported by a relative path keeps its importer's root. Relative paths
resolve against the file that contains them.

`expected.json` is an array of `{ "in", "pointer", "resolved" }`: `in` is a file relative to the case,
`pointer` a JSON pointer to a string in it, and `resolved` one of `{ "path" }` (relative to the case),
`{ "url" }`, `{ "repository": "<host>/<path>", "ref": "<ref>" | null }`, or `{ "error": "outside-root" }`.
