// Shared strict Ajv setup, main schema and validator lookup for the tests.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("..", import.meta.url).pathname;
const schemaDir = join(root, "assets/schema");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

export const main = readJson(join(schemaDir, "blueprint-schema.json"));
const baseId = main.$id.replace(/[^/]+$/, "");

export function createAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false, strictRequired: false });
  addFormats(ajv);
  ajv.addKeyword({ keyword: "x-blueprint-reference", metaSchema: { enum: ["resource", "addon"] } });
  ajv.addSchema(main);
  for (const file of readdirSync(join(schemaDir, "partials"))) {
    ajv.addSchema(readJson(join(schemaDir, "partials", file)));
  }
  return ajv;
}

const ajv = createAjv();

export const validatorFor = (partial) =>
  ajv.getSchema(partial ? `${baseId}partials/${partial}.schema.json` : main.$id);

export const errorsText = (errors) => ajv.errorsText(errors, { separator: "\n" });
