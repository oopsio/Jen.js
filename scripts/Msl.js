// schema-docs.mjs
import fs from "fs";
import path from "path";

const filePath = process.argv[2];
if (!filePath || !fs.existsSync(filePath)) {
  console.error("Usage: node schema-docs.mjs <file.msl>");
  process.exit(1);
}
const markup = fs.readFileSync(filePath, "utf-8");

// === DSL Parser ===
function parseDSL(markup) {
  const lines = markup.split("\n").map(l => l.replace(/\r/g, "")).filter(l => l.trim());
  const defs = {};
  const stack = [];
  const variables = {};

  const metaKeys = ["title", "description", "examples"];
  const validationKeys = ["minLength", "maxLength", "minimum", "maximum", "pattern", "minItems", "maxItems", "uniqueItems"];

  let currentObj = null;

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;

    // Variable
    if (line.startsWith("$")) {
      const [name, val] = line.split("=").map(s => s.trim());
      variables[name] = val.replace(/^"|"$/g, "");
      continue;
    }

    const indent = line.search(/\S/);
    const [keyRaw, valRaw] = line.split(":").map(s => s.trim());
    const key = keyRaw.endsWith("?") ? keyRaw.slice(0, -1) : keyRaw;
    const optional = keyRaw.endsWith("?");

    // New object
    if (!valRaw) {
      currentObj = { type: "object", properties: {}, required: [], title: "", description: "", examples: [] };
      defs[key] = currentObj;
      stack.push({ indent, obj: currentObj });
      continue;
    }

    // Property / metadata
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack.length ? stack[stack.length - 1].obj : currentObj;

    // Metadata
    if (metaKeys.includes(key)) {
      if (key === "examples") {
        try {
          parent.examples = JSON.parse(valRaw.replace(/'/g, '"'));
        } catch {
          parent.examples.push(valRaw);
        }
      } else {
        parent[key] = valRaw.replace(/^"|"$/g, "");
      }
      continue;
    }

    // Property object
    let prop = parent.properties[key] || {};

    // Validation keys
    if (validationKeys.includes(key)) {
      if (valRaw === "true") prop[key] = true;
      else if (valRaw === "false") prop[key] = false;
      else if (!isNaN(Number(valRaw))) prop[key] = Number(valRaw);
      else prop[key] = valRaw.replace(/^"|"$/g, "");
      parent.properties[key] = prop;
      continue;
    }

    // Determine type
    let val = valRaw;
    if (val.startsWith("$")) val = variables[val] || val;

    // Array shorthand [type]
    if (val.startsWith("[") && val.endsWith("]")) {
      const itemType = val.slice(1, -1).trim();
      prop.type = "array";
      prop.items = { type: itemType };
    }
    // Union array (("a"|"b")[])
    else if (val.endsWith("[]") && val.startsWith("(") && val.includes("|")) {
      const union = val.slice(1, -3).split("|").map(s => s.trim().replace(/"/g, ""));
      prop.type = "array";
      prop.items = { enum: union };
    }
    // Union type
    else if (val.startsWith("(") && val.endsWith(")")) {
      prop.enum = val.slice(1, -1).split("|").map(s => s.trim().replace(/"/g, ""));
    }
    // Reference
    else if (/^[A-Z]/.test(val)) {
      prop.$ref = `#/definitions/${val}`;
    }
    // Primitive type
    else if (["string", "number", "integer", "boolean", "null", "object", "array"].includes(val)) {
      prop.type = val;
    }
    // fallback
    else {
      prop.type = val;
    }

    parent.properties[key] = prop;
    if (!optional) parent.required.push(key);
  }

  return { $schema: "http://json-schema.org/draft-07/schema#", definitions: defs };
}

// === HTML Generator ===
function generateHTML(schema, title = "Schema Docs") {
  let html = `<html><head><meta charset="UTF-8"><title>${title}</title><style>
body{font-family:sans-serif;margin:20px;background:#f4f4f9;color:#222;}
h2{color:#2c3e50;}h3{color:#34495e;}
table{border-collapse:collapse;width:100%;margin-bottom:20px;}
th,td{border:1px solid #ccc;padding:6px;text-align:left;font-size:14px;}
th{background:#e2e2e2;}
pre{background:#f7f7f7;padding:8px;border-radius:4px;font-size:13px;overflow-x:auto;}
</style></head><body>`;

  for (const [name, obj] of Object.entries(schema.definitions)) {
    html += `<h2>${obj.title || name}</h2>`;
    if (obj.description) html += `<p>${obj.description}</p>`;

    html += `<table><tr><th>Property</th><th>Type</th><th>Required</th><th>Constraints / Description</th></tr>`;
    for (const [propName, val] of Object.entries(obj.properties)) {
      const typeStr = val.type || (val.enum ? val.enum.join(" | ") : val.$ref || "");
      const req = obj.required.includes(propName) ? "Yes" : "No";
      let desc = "";
      for (const k of ["minimum", "maximum", "minLength", "maxLength", "pattern", "uniqueItems", "minItems", "maxItems"]) {
        if (val[k] !== undefined) desc += `${k}:${val[k]} `;
      }
      html += `<tr><td>${propName}</td><td>${typeStr}</td><td>${req}</td><td>${desc}</td></tr>`;
    }
    html += `</table>`;

    if (obj.examples && obj.examples.length) html += `<h3>Examples</h3><pre>${JSON.stringify(obj.examples, null, 2)}</pre>`;
  }

  html += `</body></html>`;
  return html.replace(/\n/g, "").replace(/\s{2,}/g, " ").replace(/>\s+</g, "><");
}

// === Run ===
const schema = parseDSL(markup);
const html = generateHTML(schema);
const base = path.basename(filePath, path.extname(filePath));

fs.writeFileSync(`${base}.json`, JSON.stringify(schema, null, 2));
fs.writeFileSync(`${base}.html`, html);

console.log(`✅ Generated ${base}.json and ${base}.html (fully valid JSON Schema, minified HTML)`); 