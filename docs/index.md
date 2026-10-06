# Omeka S Blueprints

One JSON file that describes an Omeka S environment: modules, themes, vocabularies, resource templates, settings, users, sites and sample content. Write it once and apply it with any tool that reads the format.

[Read the reference](reference.md){ .md-button .md-button--primary }
[Browse examples](examples.md){ .md-button }

## A first blueprint

Installs Omeka S, adds two modules, an editor and a public site.

```json
--8<-- "examples/first-blueprint.json"
```

[Try it in Omeka S Playground](https://ateeducacion.github.io/omeka-s-playground/?blueprint-url=https://omeka-s-contrib.github.io/omeka-s-blueprints/examples/first-blueprint.json)

## Consumers

A consumer is a tool that reads a blueprint and applies it. The format does not depend on any of them: each one applies the keys it supports, ignores the rest, and lists what it covers in its own support matrix.

| Consumer | Runs Omeka S | How you pass a blueprint | Extension key |
|---|---|---|---|
| [Omeka S Playground](https://github.com/ateeducacion/omeka-s-playground) | In the browser (WebAssembly) | `?blueprint-url=https://…/blueprint.json` | `x-playground` |
| [Omeka-S-Cli](https://github.com/GhentCDH/Omeka-S-Cli) | On an existing instance | `omeka-s-cli blueprint:deploy site.json` | `x-omeka-s-cli` |
| [alpine-omeka-s](https://github.com/erseco/alpine-omeka-s) | In a container | `OMEKA_BLUEPRINT` variable (planned) | none |

!!! info "Building a consumer?"

    Validate input against the [schema](schema.md), ignore the keys you do not apply, and put your own options under an `x-` key. To report a blueprint that breaks, add it as a fixture in a [pull request](https://github.com/omeka-s-contrib/omeka-s-blueprints/pulls).

## What a blueprint describes

Every key is optional. Unknown keys are rejected, except extensions that start with `x-`.

| Key | What it holds |
|---|---|
| [`install`](reference.md#install) | Title, locale, timezone and first admin, used when Omeka S is installed |
| [`modules`](reference.md#modules) | Modules to download, install or activate |
| [`themes`](reference.md#themes) | Themes to make available |
| [`files`](reference.md#files) | Extra files placed in the installation, such as a module config |
| [`vocabularies`](reference.md#vocabularies) | RDF vocabularies to import |
| [`resourceTemplates`](reference.md#resourcetemplates) | Resource templates from JSON exports |
| [`settings`](reference.md#settings) | Global settings |
| [`users`](reference.md#users) | Accounts and their roles |
| [`itemSets`, `items`](reference.md#itemsets-and-items) | Sample content, with media by URL |
| [`sites`](reference.md#sites) | Sites, their theme and per-user permissions |
| [`meta`, `preferredVersions`](reference.md#meta-and-preferredversions) | Informational: title, author, PHP and Omeka S versions |
| [`x-…`](reference.md#extensions) | Options for one consumer; the others ignore them |

## Validate in your editor

Add `$schema` and editors such as VS Code check the file and suggest keys as you type.

```json
{ "$schema": "https://omeka-s-contrib.github.io/omeka-s-blueprints/schema/v0/blueprint-schema.json" }
```

See [Schema](schema.md) for the URLs and how versions work.
