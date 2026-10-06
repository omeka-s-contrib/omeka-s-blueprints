# Omeka S Blueprints

A shared, declarative JSON format to describe an Omeka S environment: modules, themes, vocabularies, resource templates, settings, users, sites and content.

The format is independent of any implementation. Each consumer applies the parts it supports and documents them in its own support matrix.

Documentation, examples and the schema: <https://omeka-s-contrib.github.io/omeka-s-blueprints/>

> [!NOTE]
> Work in progress. See the [roadmap to spec v0.1](https://github.com/omeka-s-contrib/omeka-s-blueprints/issues/1).

## Consumers

- [Omeka S Playground](https://github.com/ateeducacion/omeka-s-playground): Omeka S in the browser (WebAssembly).
- [Omeka-S-Cli](https://github.com/GhentCDH/Omeka-S-Cli): deploy and export blueprints on real instances.
- [alpine-omeka-s](https://github.com/erseco/alpine-omeka-s): container image.

## Example

```json
{
  "$schema": "https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0/blueprint-schema.json",
  "install": {
    "title": "Demo",
    "locale": "en_US",
    "timezone": "UTC",
    "admin": { "name": "Admin", "email": "admin@example.com" }
  },
  "modules": [
    { "name": "Common", "state": "activate" },
    { "name": "Mapping", "source": "https://github.com/omeka-s-modules/Mapping/releases/download/v2.1.0/Mapping-2.1.0.zip" }
  ],
  "users": [
    { "email": "editor@example.com", "role": "editor" }
  ],
  "sites": [
    { "title": "Demo site", "slug": "demo", "theme": "default" }
  ],
  "x-playground": { "landingPage": "/admin" }
}
```

## Repository layout

- `assets/schema/blueprint-schema.json`: the blueprint JSON Schema (2020-12).
- `assets/schema/partials/`: standalone schemas for lists that can be shared with `$import` (modules, themes, files, …).
- `fixtures/valid/`, `fixtures/invalid/`: conformance fixtures. Files under `fixtures/*/partials/<name>/` are validated against `partials/<name>.schema.json`.
- `docs/`: the documentation site ([Zensical](https://zensical.org), configured in `mkdocs.yml`). `docs/examples/` holds the examples shown on it.
- `tests/`: validates every fixture and example against the schema.

## Versioning

The schema is published on GitHub Pages for every tag:

- `https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0/blueprint-schema.json`: the latest `v0.x.y` release. Use this one in `$schema` and in tools: it receives fixes and new optional fields, never breaking changes.
- `https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0.1.0/blueprint-schema.json`: a fixed release, for exact pinning.

Partials live next to it, under `partials/`. Do not point to `main`, it can carry unreleased breaking changes.

Releases use [semver](https://semver.org) numbers, with floating major tags as in GitHub Actions: `v0` is already treated as a stable major, so a breaking change (a field removed, renamed or made stricter) bumps it to `v1`. Pushing a `vX.Y.Z` tag moves the floating `vX` tag to it and republishes the site. Pushes to `main` update the documentation only; the files under `schema/` always come from the tags.

## Development

```sh
npm install
npm test
```

To preview the documentation:

```sh
pip install zensical
zensical serve
```

Fixtures taken from an implementation are prefixed with its name (`playground-`, `cli-`). To report a compatibility problem, add the blueprint as a fixture in a PR.

## License

[MIT](LICENSE)
