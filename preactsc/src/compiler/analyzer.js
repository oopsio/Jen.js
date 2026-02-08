import fs from "fs";
import path from "path";

export function analyzeComponents(entryFile) {
  const analyzed = new Set();
  const serverComponents = [];
  const clientComponents = [];
  const visited = new Set();

  function walk(filePath, depth = 0) {
    // Prevent infinite recursion (circular imports, symlinks)
    if (depth > 50) {
      console.warn(`[PRSC] Maximum import depth exceeded: ${filePath}`);
      return;
    }

    if (analyzed.has(filePath)) return;
    analyzed.add(filePath);

    if (!fs.existsSync(filePath)) {
      console.warn(`[PRSC] File not found: ${filePath}`);
      return;
    }

    // Validate it's a component file
    const validExts = [".jsx", ".js", ".tsx", ".ts"];
    if (!validExts.some((ext) => filePath.endsWith(ext))) {
      console.warn(`[PRSC] Invalid file type: ${filePath}`);
      return;
    }

    let content;
    try {
      content = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
      console.warn(`[PRSC] Cannot read file: ${filePath} - ${err.message}`);
      return;
    }

    const imports = extractImports(content);

    if (filePath.endsWith(".server.jsx") || filePath.endsWith(".server.js")) {
      serverComponents.push(filePath);
    } else if (
      filePath.endsWith(".client.jsx") ||
      filePath.endsWith(".client.js")
    ) {
      clientComponents.push(filePath);
    }

    for (const importPath of imports) {
      const resolved = resolveImport(importPath, filePath);
      if (resolved) {
        walk(resolved, depth + 1);
      }
    }
  }

  walk(entryFile);

  return {
    entry: entryFile,
    server: serverComponents,
    client: clientComponents,
  };
}

function extractImports(content) {
  const imports = [];
  const importRegex =
    /import\s+(?:{[^}]*}|[^from]+)\s+from\s+["']([^"']+)["']/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function resolveImport(importPath, fromFile) {
  // Handle relative imports only (block node_modules to prevent code execution)
  if (!importPath.startsWith(".")) {
    return null;
  }

  const dir = path.dirname(fromFile);
  let resolved = path.resolve(dir, importPath);

  // Security: Normalize path and ensure it stays within project bounds
  const normalizedResolved = path.normalize(resolved);
  const projectRoot = path.resolve(process.cwd());

  // Prevent path traversal attacks
  if (!normalizedResolved.startsWith(projectRoot)) {
    console.warn(
      `[PRSC] Path traversal attempt blocked: ${importPath} from ${fromFile}`,
    );
    return null;
  }

  // Try various extensions
  const extensions = [".jsx", ".js", ".tsx", ".ts"];
  for (const ext of extensions) {
    const candidate = normalizedResolved + ext;
    if (fs.existsSync(candidate)) {
      // Validate final path is within project
      const finalNorm = path.normalize(candidate);
      if (finalNorm.startsWith(projectRoot)) {
        return finalNorm;
      }
    }

    const indexCandidate = path.join(normalizedResolved, "index" + ext);
    if (fs.existsSync(indexCandidate)) {
      const finalNorm = path.normalize(indexCandidate);
      if (finalNorm.startsWith(projectRoot)) {
        return finalNorm;
      }
    }
  }

  // Check without adding extension
  if (fs.existsSync(normalizedResolved)) {
    const finalNorm = path.normalize(normalizedResolved);
    if (finalNorm.startsWith(projectRoot)) {
      return finalNorm;
    }
  }

  return null;
}
