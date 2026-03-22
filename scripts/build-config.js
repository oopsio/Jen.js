import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function runInjector() {
  console.log('\x1b[36m--- Jen.js Interactive Config Injector ---\x1b[0m\n');

  const key = await rl.question(
    '\x1b[33m1. What is the name of the new config option? (e.g., customRouting): \x1b[0m',
  );
  const typeType = await rl.question(
    '\x1b[33m2. What type is it? (string, number, boolean): \x1b[0m',
  );
  const defaultValue = await rl.question(
    `\x1b[33m3. What is the default value for ${key}?: \x1b[0m`,
  );

  rl.close();

  console.log(
    `\n\x1b[36m[System] Injecting '${key}' into framework architecture...\x1b[0m`,
  );

  const typesPath = path.resolve(process.cwd(), 'packages/jen/src/types.ts');
  const runtimePath = path.resolve(
    process.cwd(),
    'packages/jen/src/config/config.ts',
  );

  try {
    let typesContent = fs.readFileSync(typesPath, 'utf-8');
    const interfaceRegex = /(export interface JenConfig\s*\{)([^}]*)(\})/;
    typesContent = typesContent.replace(
      interfaceRegex,
      `$1$2    ${key}?: ${typeType};\n$3`,
    );
    fs.writeFileSync(typesPath, typesContent);

    let runtimeContent = fs.readFileSync(runtimePath, 'utf-8');
    const defaultRegex =
      /(export const RuntimeConfig:\s*JenConfig\s*=\s*\{)([^}]*)(\});/;

    let formattedDefault = defaultValue;
    if (typeType === 'string') {
      formattedDefault = `'${defaultValue}'`;
    }

    runtimeContent = runtimeContent.replace(
      defaultRegex,
      `$1$2    ${key}: ${formattedDefault},\n$3;`,
    );
    fs.writeFileSync(runtimePath, runtimeContent);

    console.log(
      `\x1b[32m[SUCCESS] The config option '${key}' has been added to Jen.js\x1b[0m`,
    );
  } catch (error) {
    console.error(
      `\x1b[31m[ERROR] Could not inject the configuration. Make sure types.ts and RuntimeConfig.ts exist.\x1b[0m`,
    );
    console.error(error);
  }
}

runInjector();
