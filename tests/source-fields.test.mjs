import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { main, validatorFor } from "./ajv.mjs";

const ANNOTATION = "x-blueprint-reference";

// Static walk over the schema JSON, as described in the spec
// ("How a consumer finds the source fields"). Returns sorted, de-duplicated
// "<path>=<annotation>" strings.
export function findSourceFields(schema) {
    const found = new Set();
    const defs = schema.$defs ?? {};

    function walk(node, path, visited) {
        if (!node || typeof node !== "object") return;
        if (node.$ref !== undefined) {
            const match = /^#\/\$defs\/(.+)$/.exec(node.$ref);
            if (!match || visited.has(match[1])) return;
            const target = defs[match[1]];
            if (!target) return;
            if (target[ANNOTATION] !== undefined) {
                found.add(`${path}=${target[ANNOTATION]}`);
                return;
            }
            walk(target, path, new Set([...visited, match[1]]));
            return;
        }
        for (const key of ["oneOf", "anyOf", "allOf"]) {
            for (const branch of node[key] ?? []) walk(branch, path, visited);
        }
        for (const [name, child] of Object.entries(node.properties ?? {})) {
            walk(child, path ? `${path}.${name}` : name, visited);
        }
        if (node.items && typeof node.items === "object") {
            walk(node.items, `${path}[]`, visited);
        }
    }

    walk({ properties: schema.properties }, "", new Set());
    return [...found].sort();
}

test("the walk finds every source field", () => {
    assert.deepEqual(findSourceFields(main), [
        "files[].$import=resource", "files[].source=resource",
        "itemSets[].$import=resource", "itemSets[].source=resource",
        "items[].$import=resource", "items[].media[].url=resource", "items[].source=resource",
        "modules[].$import=resource", "modules[].source=addon",
        "resourceTemplates[].$import=resource", "resourceTemplates[].source=resource",
        "settings[].$import=resource",
        "themes[].$import=resource", "themes[].source=addon",
        "users[].$import=resource",
        "vocabularies[].$import=resource", "vocabularies[].source=resource",
    ]);
});

test("invalid source fixtures fail at a source field", () => {
    const dir = new URL("../fixtures/invalid/", import.meta.url).pathname;
    const files = readdirSync(dir).filter((f) => /^source-.*\.json$/.test(f));
    assert.ok(files.length >= 8, `expected at least 8 source-*.json fixtures, found ${files.length}`);
    const validate = validatorFor();
    for (const file of files) {
        const data = JSON.parse(readFileSync(join(dir, file), "utf8"));
        assert.equal(validate(data), false, `${file} should be invalid`);
        const paths = validate.errors.map((e) => e.instancePath);
        assert.ok(
            paths.some((p) => /\/(source|url|\$import)$/.test(p)),
            `${file}: no error at a source field, got ${paths.join(", ")}`,
        );
    }
});
