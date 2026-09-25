# Omeka S Blueprints

A shared, declarative JSON format to describe an Omeka S environment: modules, themes, vocabularies, resource templates, settings, users, sites and content.

The format is independent of any implementation. Each consumer applies the parts it supports and documents them in its own support matrix.

> [!NOTE]
> Work in progress. See the [roadmap to spec v0.1](https://github.com/omeka-s-contrib/omeka-s-blueprints/issues/1).

## Consumers

- [Omeka S Playground](https://github.com/ateeducacion/omeka-s-playground): Omeka S in the browser (WebAssembly).
- [Omeka-S-Cli](https://github.com/GhentCDH/Omeka-S-Cli): deploy and export blueprints on real instances.
- [alpine-omeka-s](https://github.com/erseco/alpine-omeka-s): container image.

## Example

```json
{
  "$schema": "https://raw.githubusercontent.com/omeka-s-contrib/omeka-s-blueprints/main/assets/schema/blueprint-schema.json",
  "siteOptions": { "title": "Demo", "locale": "en_US", "timezone": "UTC" },
  "users": [
    { "email": "admin@example.com", "password": "password", "role": "global_admin" }
  ],
  "modules": [
    { "name": "Common", "state": "activate", "source": { "type": "omeka.org", "slug": "Common" } }
  ],
  "site": { "title": "Demo site", "slug": "demo", "theme": "default" }
}
```

## Repository layout

- `assets/schema/blueprint-schema.json`: the blueprint JSON Schema (2020-12).
- `assets/schema/partials/`: standalone schemas for lists that can be shared with `$import` (modules, themes, …).
- `fixtures/valid/`, `fixtures/invalid/`: conformance fixtures. Files under `fixtures/*/partials/<name>/` are validated against `partials/<name>.schema.json`.
- `tests/`: validates every fixture against the schema.

## Development

```sh
npm install
npm test
```

Fixtures taken from an implementation are prefixed with its name (`playground-`, `cli-`). To report a compatibility problem, add the blueprint as a fixture in a PR.
