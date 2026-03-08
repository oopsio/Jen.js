import path from "path";

export function createManifest(clientPaths, outDir) {
  const manifest = [];
  const seenIds = new Set();

  clientPaths.forEach((filePath, index) => {
    // Security: Validate file path
    if (!filePath || typeof filePath !== "string") {
      console.warn(`[PRSC] Invalid file path: ${filePath}`);
      return;
    }

    // Security: Only allow relative paths starting with .
    const normalizedPath = filePath.replace(/\\/g, "/");
    if (!normalizedPath.startsWith(".") && !normalizedPath.startsWith("/")) {
      console.warn(`[PRSC] Invalid manifest path: ${normalizedPath}`);
      return;
    }

    const id = `client-${index}`;

    // Security: Prevent duplicate IDs
    if (seenIds.has(id)) {
      console.warn(`[PRSC] Duplicate component id: ${id}`);
      return;
    }
    seenIds.add(id);

    const name = path.basename(filePath).replace(/\.[jt]sx?$/, "");

    manifest.push({
      id,
      name: name.replace(/[^a-z0-9_-]/gi, "_"), // Sanitize name
      path: normalizedPath,
      props: {},
    });
  });

  return manifest;
}

export function createComponentId(filePath) {
  return path
    .basename(filePath)
    .replace(/\.[jt]sx?$/, "")
    .toLowerCase();
}

export function serializeManifest(components) {
  return JSON.stringify(
    components.map((c, i) => ({
      id: i,
      path: c.path,
      name: c.name,
      props: c.props || {},
    })),
  );
}
