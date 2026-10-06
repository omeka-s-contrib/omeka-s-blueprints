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

## Versioning

!!! note "These pages follow `main`, the schema follows releases"

    The documentation is rebuilt on every change to `main`. The files under `schema/` only come from release tags, so `schema/v0/` keeps serving the last release until a new `vX.Y.Z` tag is pushed.

Releases use [semver](https://semver.org) numbers, with floating major tags as in GitHub Actions. `v0` is already treated as a stable major: a breaking change (a field removed, renamed or made stricter) bumps it to `v1`. Pushing a `vX.Y.Z` tag moves the floating `vX` tag to it and republishes the schema.

See the [tags](https://github.com/omeka-s-contrib/omeka-s-blueprints/tags) for every release.
