# Schema

Blueprints are validated with a [JSON Schema](https://json-schema.org) (2020-12). Point `$schema` to the `v0` URL:

```json
{ "$schema": "https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0/blueprint-schema.json" }
```

## URLs

| URL | What you get |
|---|---|
| [`schema/v0/blueprint-schema.json`](https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0/blueprint-schema.json) | The latest `v0.x.y` release. It gets fixes and new optional fields, never breaking changes. Use this one. |
| [`schema/v0.1.0/blueprint-schema.json`](https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0.1.0/blueprint-schema.json) | That release, frozen, for exact pinning. |

## Partials

Lists shared with `$import` can be validated on their own, with the schema under `partials/` next to the main one:

| List | Schema |
|---|---|
| `modules` | [`schema/v0/partials/modules.schema.json`](https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0/partials/modules.schema.json) |
| `themes` | [`schema/v0/partials/themes.schema.json`](https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0/partials/themes.schema.json) |
| `files` | [`schema/v0/partials/files.schema.json`](https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0/partials/files.schema.json) |
| `vocabularies` | [`schema/v0/partials/vocabularies.schema.json`](https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0/partials/vocabularies.schema.json) |
| `resourceTemplates` | [`schema/v0/partials/resourceTemplates.schema.json`](https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0/partials/resourceTemplates.schema.json) |
| `settings` | [`schema/v0/partials/settings.schema.json`](https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0/partials/settings.schema.json) |
| `users` | [`schema/v0/partials/users.schema.json`](https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0/partials/users.schema.json) |

## Source fields

Every field that holds a source references a type with the `x-blueprint-reference` annotation:
`resource` for a single file, `addon` for a module or theme source, which may also be a git
repository. To find the source fields, walk the schema from the root `properties`: `properties`
adds `.name` to the path, `items` adds `[]`, and `anyOf`, `oneOf` and `allOf` keep it. Follow local
`$ref`s together with the keywords next to them, skip a definition already on the path, and stop at
a node that has the annotation, on itself or on its `$ref` target. Every future source field will
use one of these annotation values. A tool
should stop with an error on an annotation value it does not know. The three `datasource.*` forms
(`relativePath`, `url`, `git`) identify a value by its prefix, as the WordPress Playground's
blueprint schema does; they do not validate it. How a consumer reads each form is described in the
[reference](reference.md#common-rules).

## Versioning

!!! note "These pages follow `main`, the schema follows releases"

    The documentation is rebuilt on every change to `main`. The files under `schema/` only come from release tags, so `schema/v0/` keeps serving the last release until a new `vX.Y.Z` tag is pushed.

Releases use [semver](https://semver.org) numbers, with floating major tags as in GitHub Actions. `v0` is already treated as a stable major: a breaking change bumps it to `v1`. A breaking change removes or renames a field, or rejects a value that the format described and that consumers accept. Rejecting input errors (an empty string, a URL without a host, leading whitespace), values the format never described, or values no consumer accepts, is not breaking. A consumer's own extensions are not part of the format. Pushing a `vX.Y.Z` tag moves the floating `vX` tag to it and republishes the schema.

See the [tags](https://github.com/omeka-s-contrib/omeka-s-blueprints/tags) for every release.
