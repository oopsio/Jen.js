import fs from "fs";
import path from "path";

export function createCommand(args) {
  const name = args[0];
  const template = args[1]?.split("=")[1] || "ssg";
  if (!name) {
    console.log("Usage: myfw create <name> --template=<ssg|ssr>");
    return;
  }

  const projectDir = path.resolve(name);
  if (fs.existsSync(projectDir)) {
    console.log("Error: Directory already exists");
    return;
  }

  fs.mkdirSync(projectDir, { recursive: true });

  // Copy template files
  const templateDir = path.resolve("src/cli/templates", template);
  copyFolder(templateDir, projectDir);

  console.log(
    `Created new app '${name}' using ${template.toUpperCase()} template`,
  );
}

// Recursively copy folder
function copyFolder(src, dest) {
  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyFolder(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
