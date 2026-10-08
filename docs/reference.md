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
