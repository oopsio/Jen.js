import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pc from "picocolors";
import {
  intro,
  outro,
  text,
  confirm,
  select,
  cancel,
  isCancel,
  note,
  spinner,
} from "@clack/prompts";
import { copyTemplateFiles, createProjectFiles } from "./generator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ProjectOptions {
  projectName: string;
  template: "static" | "ssr-isr";
  typescript: boolean;
  installDeps: boolean;
  gitInit: boolean;
}

function validateProjectName(val: string | undefined): string | undefined {
  if (!val) return "Project name is required";
  if (!/^[a-zA-Z0-9._-]+$/.test(val)) {
    return "Project name can only contain alphanumeric characters, dots, dashes and underscores";
  }
  return undefined;
}

export async function createJenApp() {
  intro(pc.cyan(pc.bold("Jen.js")) + pc.dim(" - create app"));

  // Get project name from CLI args or prompt
  let projectName = process.argv[2];

  // @ts-nocheck

  if (!projectName) {
    const res = await text({
      message: "Project name",
      placeholder: "my-jen-app",
      defaultValue: "my-jen-app",
      validate: validateProjectName,
    });

    if (isCancel(res)) {
      cancel(pc.dim("Cancelled"));
      process.exit(0);
    }

    projectName = res;
  }

  const projectDir = path.resolve(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(projectDir)) {
    const overwrite = await confirm({
      message: `${pc.yellow(projectName)} already exists. Overwrite?`,
      initialValue: false,
    });

    if (isCancel(overwrite)) {
      cancel(pc.dim("Cancelled"));
      process.exit(0);
    }

    if (!overwrite) {
      cancel(pc.dim("Cancelled"));
      process.exit(0);
    }

    fs.rmSync(projectDir, { recursive: true, force: true });
  }

  note("Configuring your project", pc.magenta("Setup"));

  // Template selection
  const template = await select({
    message: "Select a template",
    options: [
      {
        label: `${pc.cyan("Static")} - Pure SSG with components`,
        value: "static",
        hint: "Fast, lightweight static sites",
      },
      {
        label: `${pc.green("SSR & ISR")} - Server-side rendering with incremental static regeneration`,
        value: "ssr-isr",
        hint: "Dynamic content with cached pages",
      },
    ],
  });

  if (isCancel(template)) {
    cancel(pc.dim("Cancelled"));
    process.exit(0);
  }

  // TypeScript
  const typescript = await confirm({
    message: "Use TypeScript?",
    initialValue: true,
  });

  if (isCancel(typescript)) {
    cancel(pc.dim("Cancelled"));
    process.exit(0);
  }

  // Deps installation
  const installDeps = await confirm({
    message: "Install dependencies?",
    initialValue: true,
  });

  if (isCancel(installDeps)) {
    cancel(pc.dim("Cancelled"));
    process.exit(0);
  }

  // Git initialization
  const gitInit = await confirm({
    message: "Initialize git repository?",
    initialValue: true,
  });

  if (isCancel(gitInit)) {
    cancel(pc.dim("Cancelled"));
    process.exit(0);
  }

  const options: ProjectOptions = {
    projectName,
    template,
    typescript,
    installDeps,
    gitInit,
  };

  note("Creating project files", pc.green("Generator"));

  // Spinner for progress
  const s = spinner();

  // Create project structure
  s.start("Setting up directories");
  fs.mkdirSync(projectDir, { recursive: true });
  s.stop(pc.green("Directories created"));

  // Copy template files
  s.start("Copying template files");
  const templateDir = path.join(__dirname, "..", "templates", options.template);
  if (fs.existsSync(templateDir)) {
    copyTemplateFiles(templateDir, projectDir);
  }
  s.stop(pc.green("Template files copied"));

  // Create project files
  s.start("Generating configuration files");
  createProjectFiles(projectDir, options);
  s.stop(pc.green("Configuration files generated"));

  // Git init
  if (options.gitInit) {
    s.start("Initializing git repository");
    try {
      const { execSync } = await import("child_process");
      execSync("git init", { cwd: projectDir, stdio: "pipe" });

      fs.writeFileSync(
        path.join(projectDir, ".gitignore"),
        `node_modules/
dist/
.jen/
.env
.env.local
.DS_Store
*.log
`,
      );

      s.stop(pc.green("Git repository initialized"));
    } catch {
      s.stop(pc.yellow("Git initialization skipped"));
    }
  }

  outro(pc.green(pc.bold(" Your Jen.js app is ready!")));

  const nextSteps = [
    pc.cyan(`cd ${projectName}`),
    installDeps
      ? pc.cyan("npm run dev") + pc.dim("  # start dev server")
      : pc.cyan("npm install") + pc.dim("  # then npm run dev"),
  ];

  console.log("\n" + pc.bold("Next steps:"));
  for (const step of nextSteps) console.log("  " + pc.dim("• ") + step);

  console.log("\n" + pc.dim("Happy coding! ") + "\n");
}
