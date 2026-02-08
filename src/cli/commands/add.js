import fs from "fs";
import path from "path";

export function addCommand(args) {
  const type = args[0];
  const name = args[1];
  if (!type || !name) {
    console.log("Usage: jen add <page|plugin> <name>");
    return;
  }

  switch (type) {
    case "page":
      addPage(name);
      break;
    case "plugin":
      addPlugin(name);
      break;
    default:
      console.log("Unknown type. Use 'page' or 'plugin'");
  }
}

function addPage(name) {
  const fileName = `${name}.tsx`;
  const pagesDir = path.resolve("site");
  if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir);
  fs.writeFileSync(
    path.join(pagesDir, fileName),
    `export default function ${name}() { return <div>${name}</div>; }`,
  );
  console.log(`Created page: ${fileName}`);
}

function addPlugin(name) {
  const fileName = `${name}.lua`;
  const pluginDir = path.resolve("src/plugin/plugins");
  if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir, { recursive: true });
  fs.writeFileSync(
    path.join(pluginDir, fileName),
    `return function(hook, ctx)\n  print("[Plugin ${name}] hook", hook)\nend`,
  );
  console.log(`Created plugin: ${fileName}`);
}
