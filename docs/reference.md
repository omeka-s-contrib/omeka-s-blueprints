# Reference

Every top-level key of a blueprint, its fields and how consumers read them.

## Common rules

- **Strict keys.** Unknown keys are rejected. Only top-level keys that start with `x-` are free-form.
- **`$import`.** Any list entry can be `{ "$import": "path-or-url" }`. The file it points to holds more entries of the same list (or a single entry), spliced in place. How relative `$import` paths resolve is still being specified ([#10](https://github.com/omeka-s-contrib/omeka-s-blueprints/issues/10)).
- **Last one wins.** When two entries describe the same thing, the later one applies and consumers should warn.
- **Relative paths** in `files` and `vocabularies` resolve against the blueprint file.
- **Optional parts.** A consumer may ignore keys it does not support, and documents which ones in its support matrix.

```json
"modules": [
  "Common",
  { "$import": "./partials/modules.json" }
]
```

## `install`

Values used when Omeka S is installed. Consumers that work on an existing installation ignore them.

| Field | Type | Description |
|---|---|---|
| `title` | string | Installation title |
| `locale` | string | For example `en_US` |
| `timezone` | string | For example `UTC` |
| `admin` | object | First global admin: `email` (required), `name`, `password`. Without a password, the consumer takes one from its own input or generates it. |

## `modules`

Each entry is a module name, an object or an `$import`.

| Field | Type | Description |
|---|---|---|
| `name` | string, required | Module directory name, such as `CleanUrl` |
| `state` | `download`, `install` or `activate` | `download` places the files, `install` installs, `activate` installs and enables |
| `version` | string | Release on omeka.org, or tag or branch of a git source. A ZIP `source` wins over it. |
| `source` | string | ZIP URL, git URL or `gh:owner/repo`. Without it, the module already installed is used, or `name` is looked up on omeka.org. |

```json
"modules": [
  "Common",
  { "name": "EasyAdmin", "version": "3.4.30" },
  { "name": "Mapping", "source": "https://github.com/omeka-s-modules/Mapping/releases/download/v2.1.0/Mapping-2.1.0.zip" },
  { "name": "Log", "source": "gh:Daniel-KM/Omeka-S-module-Log", "state": "install" }
]
```

## `themes`

Same forms as `modules`, without `state`.

```json
"themes": [ "default", { "name": "freedom", "source": "gh:omeka-s-themes/freedom" } ]
```

## `files`

Files copied into the installation after modules and themes are in place.

| Field | Type | Description |
|---|---|---|
| `source` | string, required | Path or URL of the file |
| `destination` | string, required | Path inside the Omeka S root. Absolute paths and `..` are not allowed. |
| `extract` | boolean, default `false` | Unzip `source` into `destination`. A single top-level directory in the archive is skipped, as with add-ons. |

```json
"files": [
  { "source": "./config/cleanurl.config.php", "destination": "config/cleanurl.config.php" }
]
```

## `vocabularies`

RDF vocabularies imported with the RDF importer.

| Field | Type | Description |
|---|---|---|
| `source` | string, required | Path or URL of the RDF file |
| `namespaceUri`, `prefix`, `label` | string, required | How the vocabulary appears in Omeka S |
| `comment`, `format`, `lang` | string | Passed to the importer |
| `labelProperty`, `commentProperty` | string | RDF properties to read labels and comments from |

```json
"vocabularies": [
  { "prefix": "schema", "namespaceUri": "https://schema.org/", "label": "schema.org", "source": "https://schema.org/version/latest/schemaorg-current-https.rdf" }
]
```

## `resourceTemplates`

Resource templates imported from a JSON export.

| Field | Type | Description |
|---|---|---|
| `source` | string, required | Path or URL of the export |
| `label` | string | Label to use instead of the one in the export |
| `ignoreDeps` | boolean | Skip the dependency check when importing |

## `settings`

Global settings, as a map of setting id to value, or a list of maps and `$import` entries merged in order.

```json
"settings": { "installation_title": "Blueprint Demo" }
```

## `users`

| Field | Type | Description |
|---|---|---|
| `email` | string, required | Identifies the user |
| `role` | string | `global_admin`, `site_admin`, `editor`, `reviewer`, `author`, `researcher`, or a role added by a module (such as `guest`) |
| `username`, `password` | string | Account details. Avoid passwords in blueprints used in production. |
| `isActive` | boolean | Whether the account can log in |
| `settings` | object | Per-user settings, such as `limit_to_granted_sites` |

## `itemSets` and `items`

Sample content. An item set has a `title` (required) and a `description`.

| Item field | Type | Description |
|---|---|---|
| `title` | string, required | |
| `description`, `creator` | string | |
| `itemSets` | list of strings | Titles of item sets in the blueprint |
| `sites` | list of strings | Slugs or titles of the sites the item belongs to. Defaults to the default site. |
| `media` | list | Each one has a `url` (required), `title` and `altText`. `type` is `url`, the only type so far. |

### Portable JSON-LD sources

An entry of `itemSets` or `items` can instead point to a portable JSON-LD file with `source`. The file is Omeka's JSON-LD for one resource, with an inline `@context`, and it names the records it refers to instead of using instance ids, so it can be imported into any installation. [Omeka-S-Cli](https://github.com/GhentCDH/Omeka-S-Cli)'s `item:export` and `item-set:export` write these files.

```json
"itemSets": [{ "source": "./content/item-sets/photographs.jsonld", "title": "Photographs" }],
"items": [
  {
    "source": "./content/items/harbour.jsonld",
    "sites": ["collections"],
    "media": [{ "url": "./content/media/harbour.png" }]
  }
]
```

| Field | Type | Description |
|---|---|---|
| `source` | string, required | Path or URL to the JSON-LD file. A relative path resolves against the file that declares the entry. |
| `title` | string | The title in the file. Only used in messages, and so that a simple item can name a source item set in `itemSets`. |
| `sites` | list of strings | Items only. Slugs or titles that replace the file's `o:site`. |
| `media` | list | Items only. As in a simple item. |

Every other property, item sets included, belongs in the file. References use the [`o-ref` vocabulary](https://omeka-s-contrib.github.io/omeka-s-ref/ns) (`https://omeka-s-contrib.github.io/omeka-s-ref/ns#`), recognized by its namespace under any prefix:

- `o-ref:id` is the record's own identity, `{"<term>": "<value>"}`. Without it, the title identifies the record. A record that already exists is left as it is, so applying a blueprint again creates nothing new.
- `o-ref:ref` links to another record wherever Omeka S writes `{"o:id": …}`: `o:item_set`, or a value of type `resource:*`. It names a record by one property value.
- Classes are named by `{"o:term"}`, resource templates by `{"o:label"}` and sites by `{"o:slug"}`.
- Properties are matched by namespace URI, so the file's prefixes do not have to match the installation's.

Item sets are created before items, each list in order, so a reference should point to a record declared earlier or already in the installation. An item keeps the file's `o:site` unless the entry gives `sites`; with no site, or none that matches, it goes to the default site.

### Errors

Every entry of `itemSets` and `items`, simple or with a `source`, takes `onError`:

| Value | Meaning |
|---|---|
| `fail` (default) | If the entry cannot be applied, the consumer stops. |
| `skip` | The consumer leaves the entry out and reports it with a warning. |

```json
"items": [
  { "source": "./content/items/harbour.jsonld", "onError": "skip" }
]
```

These are errors for an entry:

- a missing vocabulary, or an unknown property, class, template or data type;
- a media file that cannot be fetched or that Omeka S rejects;
- a dependency that cannot be resolved: an `o-ref:ref` that matches no record or more than one, or an item set in a simple item's `itemSets` that does not exist. A skipped entry counts as missing for the entries that depend on it, and their own `onError` decides what happens.

A record that already exists is not an error: the identity rules above leave it as it is. An `$import` entry has no `onError`; the entries in the imported file carry their own. Demo blueprints mark their sample content `"skip"`, so that a broken link does not stop the deploy.

## `sites`

| Field | Type | Description |
|---|---|---|
| `title` | string, required | |
| `slug`, `summary` | string | |
| `theme` | string | Theme name, as in `themes` |
| `isPublic` | boolean | |
| `setAsDefault` | boolean | Make it the default site |
| `assignNewItems` | boolean, default `true` | Add items created later without an explicit site (CSV imports, API calls) to this site, as the Omeka S admin form does. Set it to `false` to keep a site's items under explicit control. |
| `permissions` | list | Each one has a `user` (email of a blueprint user, required) and a `role`: `viewer`, `editor` or `admin` |

## `meta` and `preferredVersions`

Informational. `meta` has `title`, `author` and `description`. `preferredVersions` has the `php` and `omeka` versions the blueprint was written for.

## Extensions

Options for one consumer go under a top-level key that starts with `x-`. Its content is defined by that consumer; the others ignore it.

```json
"x-playground": { "landingPage": "/admin" }
```
