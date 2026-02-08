import fs from "fs";
import path from "path";

interface ProjectOptions {
  projectName: string;
  template: string;
  typescript: boolean;
  installDeps: boolean;
  gitInit: boolean;
}

export function copyTemplateFiles(src: string, dest: string) {
  if (!fs.existsSync(src)) {
    return;
  }

  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyTemplateFiles(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export function createProjectFiles(dir: string, options: ProjectOptions) {
  // Read template's package.json if it exists
  let templatePackageJson: any = {};
  const templatePackagePath = path.join(dir, "package.json");
  if (fs.existsSync(templatePackagePath)) {
    const content = fs.readFileSync(templatePackagePath, "utf-8");
    templatePackageJson = JSON.parse(content);
  }

  // Merge with user project name
  const packageJson = {
    ...templatePackageJson,
    name: options.projectName.toLowerCase().replace(/\s+/g, "-"),
    version: "0.1.0",
    type: "module",
    scripts: {
      ...templatePackageJson.scripts,
      dev: "jen dev",
      build: "jen build",
      start: "jen start",
      ...(options.typescript && { typecheck: "tsc --noEmit" }),
    },
    dependencies: {
      ...templatePackageJson.dependencies,
      "@jenjs/master": "^1.2.5",
    },
    devDependencies: {
      ...templatePackageJson.devDependencies,
      ...(options.typescript && {
        "@types/node": "^22.10.0",
        typescript: "^5.7.2",
      }),
    },
  };

  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  // Create tsconfig.json if TypeScript
  if (options.typescript) {
    const tsconfig = {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "node",
        strict: true,
        jsx: "react-jsx",
        jsxImportSource: "preact",
        lib: ["ES2022", "DOM", "DOM.Iterable"],
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        allowImportingTsExtensions: true,
      },
      include: ["site/**/*"],
      exclude: ["node_modules", "dist"],
    };

    fs.writeFileSync(
      path.join(dir, "tsconfig.json"),
      JSON.stringify(tsconfig, null, 2),
    );
  }

  // Create README
  const readme = `# ${options.projectName}

A beautiful Jen.js application.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Available Commands

- \`npm run dev\` - Start development server (http://localhost:3000)
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
${options.typescript ? "- \`npm run typecheck\` - Check TypeScript types\n" : ""}

## Project Structure

\`\`\`
src/
  ├── styles/          # Global styles
  ├── components/      # Preact components
  └── routes/          # Page routes
dist/                  # Build output
jen.config.ts          # Jen.js configuration
\`\`\`

## Learn More

- [Jen.js Documentation](https://github.com/kessud2021/Jen.js)
- [Preact Documentation](https://preactjs.com)

## License

MIT
`;

  fs.writeFileSync(path.join(dir, "README.md"), readme);

  // Create .env.example
  const envExample = `# Database
DATABASE_URL=

# API
API_SECRET=

# Environment
NODE_ENV=development
`;

  fs.writeFileSync(path.join(dir, ".env.example"), envExample);

  // Create directory structure
  const dirs = ["site/styles", "site/components", "site/routes", "site/assets"];

  for (const dir_path of dirs) {
    fs.mkdirSync(path.join(dir, dir_path), { recursive: true });
  }
}
