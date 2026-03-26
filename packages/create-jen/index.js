#!/usr/bin/env node

import { intro, outro, text, spinner, note } from '@clack/prompts';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function main() {
  intro(`Create Jen.js App`);

  const projectName = await text({
    message: 'What is your project named?',
    placeholder: 'my-jen-app',
    validate(value) {
      if (!value || value.length === 0) return `Value is required!`;
    },
  });

  const projectDir = path.resolve(projectName);

  const s = spinner();
  s.start('Scaffolding your project...');

  // 1. Create project directory
  await mkdir(projectDir, { recursive: true });

  // 2. package.json setup
  const pkg = {
    name: projectName,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      "dev": "jen dev",
      "build": "jen build",
      "start": "serve dist/static"
    },
    dependencies: {
      "preact": "latest",
      "we-jenjs": "latest"
    },
    devDependencies: {
      "typescript": "latest",
      "serve": "latest"
    }
  };

  await writeFile(
    path.join(projectDir, 'package.json'),
    JSON.stringify(pkg, null, 2)
  );

  // 3. tsconfig.json setup
  const tsconfig = {
    compilerOptions: {
      target: "ESNext",
      module: "ESNext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      jsxImportSource: "preact",
      allowImportingTsExtensions: true,
      noEmit: true,
      strict: true,
      skipLibCheck: true
    },
    include: ["pages"]
  };

  await writeFile(
    path.join(projectDir, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2)
  );

  // 4. Create pages directory and app.tsx
  await mkdir(path.join(projectDir, 'pages'), { recursive: true });

  const appTsxContent = `import { render } from 'preact';
import { useState } from 'preact/hooks';

/**
 * Jen.js Counter Component
 * Simple, minimalist state management.
 */
export default function Counter() {
  const [count, setCount] = useState(0);

  const containerStyle = {
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    marginTop: '50px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    display: 'inline-block'
  };

  const buttonStyle = {
    padding: '8px 16px',
    margin: '0 5px',
    cursor: 'pointer',
    background: '#fafafa',
    border: '1px solid #999'
  };

  return (
    <div style={containerStyle}>
      <h1>Jen.js + Preact</h1>
      <p style={{ fontSize: '1.5rem' }}>Count: <strong>{count}</strong></p>
      <button style={buttonStyle} onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button style={buttonStyle} onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
}`;

  await writeFile(path.join(projectDir, 'pages', 'app.tsx'), appTsxContent);

  s.stop('Project structure created!');

  note(`Next steps:
  cd ${projectName}
  npm install
  npm run dev`, 'Generated successfully');

  outro(`Good luck building with Jen.js!`);
}

main().catch(console.error);