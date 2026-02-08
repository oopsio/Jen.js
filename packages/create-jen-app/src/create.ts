import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prompts from "prompts";
import {
  printBanner,
  printSection,
  printSuccess,
  printNext,
  colors,
  symbols,
  printStep,
  printInfo,
} from "./colors.js";
import { copyTemplateFiles, createProjectFiles } from "./generator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ProjectOptions {
  projectName: string;
  template: "static";
  typescript: boolean;
  installDeps: boolean;
  gitInit: boolean;
}

export async function createJenApp() {
  printBanner();

  // Get project name from CLI args or prompt
  let projectName = process.argv[2];

  if (!projectName) {
    const response = await prompts({
      type: "text",
      name: "projectName",
      message: "Project name",
      initial: "my-jen-app",
      validate: (val: string) => {
        if (!val) return "Project name is required";
        if (!/^[a-zA-Z0-9._-]+$/.test(val)) {
          return "Project name can only contain alphanumeric characters, dots, dashes and underscores";
        }
        return true;
      },
    });
    projectName = response.projectName;
  }

  const projectDir = path.resolve(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(projectDir)) {
    const overwrite = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `${colors.warning(projectName)} already exists. Overwrite?`,
      initial: false,
    });

    if (!overwrite.overwrite) {
      console.log(`${colors.dim("Cancelled")}`);
      process.exit(0);
    }

    fs.rmSync(projectDir, { recursive: true });
  }

  printSection(`${symbols.sparkles} Configuring your project`);

  // Template selection
  const templateResponse = await prompts({
    type: "select",
    name: "template",
    message: "Select a template",
    choices: [
      {
        title: `${colors.accent("Static")} - Pure SSG with components`,
        value: "static",
        description: "Fast, lightweight static sites",
      },
    ],
  });

  // TypeScript
  const tsResponse = await prompts({
    type: "confirm",
    name: "typescript",
    message: "Use TypeScript?",
    initial: true,
  });

  // Deps installation
  const depsResponse = await prompts({
    type: "confirm",
    name: "installDeps",
    message: "Install dependencies?",
    initial: true,
  });

  // Git initialization
  const gitResponse = await prompts({
    type: "confirm",
    name: "gitInit",
    message: "Initialize git repository?",
    initial: true,
  });

  const options: ProjectOptions = {
    projectName,
    template: templateResponse.template,
    typescript: tsResponse.typescript,
    installDeps: depsResponse.installDeps,
    gitInit: gitResponse.gitInit,
  };

  printSection(`${symbols.rocket} Creating project`);

  // Create project structure
  printStep(1, 4, "Setting up directories");
  fs.mkdirSync(projectDir, { recursive: true });
  printSuccess("Directories created");

  // Copy template files
  printStep(2, 4, "Copying template files");
  const templateDir = path.join(__dirname, "..", "templates", options.template);
  if (fs.existsSync(templateDir)) {
    copyTemplateFiles(templateDir, projectDir);
  }
  printSuccess("Template files copied");

  // Create project files
  printStep(3, 4, "Generating configuration files");
  createProjectFiles(projectDir, options);
  printSuccess("Configuration files generated");

  // Git init
  if (options.gitInit) {
    printStep(4, 4, "Initializing git repository");
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
      printSuccess("Git repository initialized");
    } catch {
      printInfo("Git initialization skipped");
    }
  }

  // Success message
  console.log(
    `\n${colors.accent(colors.bold("✨ Your Jen.js app is ready!"))}`,
  );

  const nextSteps = [
    `${colors.cyan(`cd ${projectName}`)}`,
    options.installDeps
      ? `${colors.cyan("npm run dev")} ${colors.dim("to start development server")}`
      : `${colors.cyan("npm install")} then ${colors.cyan("npm run dev")}`,
  ];

  printNext(nextSteps);

  console.log(`\n${colors.dim("Happy coding! 🎉")}\n`);
}
