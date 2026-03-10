import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import type { FrameworkConfig } from "../core/config.js";
import { resolveDistPath } from "../core/paths.js";
import { log } from "../shared/log.js";

export interface BundleModule {
  path: string;
  name: string;
  size: number;
  gzipSize: number;
  percentage: number;
  imports: string[];
  importedBy: string[];
  package?: string;
  isLarge: boolean;
}

export interface BundleAnalysis {
  modules: BundleModule[];
  totalSize: number;
  totalGzipSize: number;
  duplicateModules: Map<string, number>;
  packages: Map<string, { size: number; modules: string[] }>;
  timestamp: string;
  entryPoints: string[];
}

export interface TreemapNode {
  name: string;
  path: string;
  value: number;
  percentage: number;
  children?: TreemapNode[];
  isLarge?: boolean;
  package?: string;
}

async function gzipSize(buffer: Buffer): Promise<number> {
  const zlib = await import("node:zlib");
  return new Promise((resolve, reject) => {
    zlib.gzip(buffer, (err: Error | null, result: Buffer) => {
      if (err) reject(err);
      else resolve(result.length);
    });
  });
}

function extractPackageName(modulePath: string): string {
  if (modulePath.includes("node_modules")) {
    const parts = modulePath.split("node_modules");
    const afterModules = parts[1];
    if (afterModules) {
      const match = afterModules.match(/[/\\]([^/\\]+)/);
      return match ? match[1] : "unknown";
    }
  }
  return "local";
}

function categorizeModule(modulePath: string): string {
  if (modulePath.includes("node_modules")) {
    return "dependencies";
  }
  if (modulePath.startsWith("/") || modulePath.includes(":")) {
    return "src";
  }
  return "other";
}

export async function analyzeBundle(
  config: FrameworkConfig,
): Promise<BundleAnalysis> {
  const dist = resolveDistPath(config);
  const metaFiles = [
    join(dist, "preact-runtime-meta.json"),
    join(dist, "polyfills-meta.json"),
  ];

  const allModules: BundleModule[] = [];
  const packageMap = new Map<string, { size: number; modules: string[] }>();
  const duplicateMap = new Map<string, number>();
  const pathCountMap = new Map<string, number>();

  let totalSize = 0;
  let totalGzipSize = 0;
  const entryPoints: string[] = [];

  for (const metaFile of metaFiles) {
    if (!existsSync(metaFile)) {
      continue;
    }

    try {
      const metaContent = readFileSync(metaFile, "utf-8");
      const meta = JSON.parse(metaContent);

      const inputs = meta.inputs || {};
      const outputs = meta.outputs || {};

      for (const [outputPath, outputData] of Object.entries(
        outputs as Record<string, any>,
      )) {
        const entryPoint = outputData.entryPoint;
        if (entryPoint) {
          entryPoints.push(entryPoint);
        }
      }

      for (const [inputPath, inputData] of Object.entries(
        inputs as Record<string, any>,
      )) {
        const bytes = inputData.bytes || 0;
        if (bytes === 0) continue;

        const normalizedPath = inputPath.replace(/^<(.+)>$/, "$1");

        pathCountMap.set(
          normalizedPath,
          (pathCountMap.get(normalizedPath) || 0) + 1,
        );

        let gzipBytes = 0;
        const fullInputPath = join(dist, "..", normalizedPath);
        if (existsSync(fullInputPath)) {
          const content = readFileSync(fullInputPath);
          gzipBytes = await gzipSize(content);
        }
        if (gzipBytes === 0) {
          gzipBytes = Math.floor(bytes * 0.3);
        }

        const packageName = extractPackageName(normalizedPath);

        const module: BundleModule = {
          path: normalizedPath,
          name: basename(normalizedPath),
          size: bytes,
          gzipSize: gzipBytes,
          percentage: 0,
          imports: inputData.imports?.map((i: any) => i.original || "") || [],
          importedBy: [],
          package: packageName,
          isLarge: bytes > 50000,
        };

        allModules.push(module);
        totalSize += bytes;
        totalGzipSize += gzipBytes;

        if (!packageMap.has(packageName)) {
          packageMap.set(packageName, { size: 0, modules: [] });
        }
        const pkg = packageMap.get(packageName)!;
        pkg.size += bytes;
        pkg.modules.push(normalizedPath);
      }
    } catch (err) {
      log.warn(`Failed to parse metafile ${metaFile}: ${err}`);
    }
  }

  for (const [path, count] of pathCountMap) {
    if (count > 1) {
      duplicateMap.set(path, count);
    }
  }

  for (const mod of allModules) {
    mod.percentage = totalSize > 0 ? (mod.size / totalSize) * 100 : 0;
  }

  allModules.sort((a, b) => b.size - a.size);

  return {
    modules: allModules,
    totalSize,
    totalGzipSize,
    duplicateModules: duplicateMap,
    packages: packageMap,
    timestamp: new Date().toISOString(),
    entryPoints,
  };
}

function buildTreemap(modules: BundleModule[]): TreemapNode {
  const packageGroups = new Map<string, BundleModule[]>();

  for (const mod of modules) {
    const pkg = mod.package || "other";
    if (!packageGroups.has(pkg)) {
      packageGroups.set(pkg, []);
    }
    packageGroups.get(pkg)!.push(mod);
  }

  const children: TreemapNode[] = [];

  for (const [pkg, mods] of packageGroups) {
    const pkgSize = mods.reduce((sum, m) => sum + m.size, 0);
    const totalSize = modules.reduce((sum, m) => sum + m.size, 0);

    const pkgChildren: TreemapNode[] = mods.map((m) => ({
      name: m.name,
      path: m.path,
      value: m.size,
      percentage: m.percentage,
      isLarge: m.isLarge,
      package: m.package,
    }));

    children.push({
      name: pkg,
      path: pkg,
      value: pkgSize,
      percentage: totalSize > 0 ? (pkgSize / totalSize) * 100 : 0,
      children: pkgChildren,
    });
  }

  return {
    name: "bundle",
    path: "bundle",
    value: modules.reduce((sum, m) => sum + m.size, 0),
    percentage: 100,
    children,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s*([{}:;,=])\s*/g, "$1")
    .trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function generateBundleReport(
  config: FrameworkConfig,
): Promise<string> {
  log.info("Analyzing bundle...");

  const analysis = await analyzeBundle(config);
  const treemapData = buildTreemap(analysis.modules);

  // Prepare data for template
  const modulesJson = JSON.stringify(analysis.modules);
  const treemapJson = JSON.stringify(treemapData);
  const packagesJson = JSON.stringify(Object.fromEntries(analysis.packages));
  const duplicatesJson = JSON.stringify(
    Object.fromEntries(analysis.duplicateModules),
  );

  const html = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
    }
    .header {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .header h1 { font-size: 20px; font-weight: 600; }
    .header .badge {
      background: var(--accent);
      color: var(--bg-primary);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .stats-bar {
      display: flex;
      gap: 24px;
      padding: 16px 24px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }
    .stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .stat-label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-value {
      font-size: 20px;
      font-weight: 600;
    }
    .controls {
      display: flex;
      gap: 12px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      align-items: center;
    }
    .search-box {
      flex: 1;
      min-width: 200px;
      max-width: 400px;
      position: relative;
    }
    .search-box input {
      width: 100%;
      padding: 8px 12px 8px 36px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 14px;
    }
    .search-box input:focus {
      outline: none;
      border-color: var(--accent);
    }
    .search-box::before {
      content: "⌕";
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-secondary);
    }
    .btn {
      padding: 8px 16px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn:hover { background: var(--border); }
    .btn.active {
      background: var(--accent);
      border-color: var(--accent);
      color: var(--bg-primary);
    }
    .toggle-group {
      display: flex;
      gap: 4px;
      background: var(--bg-tertiary);
      border-radius: 6px;
      padding: 4px;
    }
    .toggle-group .btn {
      border: none;
      background: transparent;
      padding: 6px 12px;
    }
    .toggle-group .btn.active {
      background: var(--accent);
      color: var(--bg-primary);
    }
    .main-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 0;
      height: calc(100vh - 200px);
    }
    @media (max-width: 1024px) {
      .main-content { grid-template-columns: 1fr; height: auto; }
    }
    .treemap-container {
      background: var(--bg-secondary);
      margin: 16px;
      border-radius: 8px;
      border: 1px solid var(--border);
      overflow: hidden;
      position: relative;
    }
    .treemap-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      font-weight: 600;
      font-size: 14px;
    }
    #treemap {
      width: 100%;
      height: calc(100% - 45px);
      position: relative;
    }
    .treemap-cell {
      position: absolute;
      border: 1px solid var(--bg-primary);
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.1s, box-shadow 0.1s;
    }
    .treemap-cell:hover {
      z-index: 10;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .treemap-cell.large {
      background: linear-gradient(135deg, var(--danger) 0%, #ff6b6b 100%);
    }
    .treemap-cell.medium {
      background: linear-gradient(135deg, var(--warning) 0%, #ffd43b 100%);
    }
    .treemap-cell.small {
      background: linear-gradient(135deg, var(--accent) 0%, #79c0ff 100%);
    }
    .treemap-cell.local {
      background: linear-gradient(135deg, var(--success) 0%, #56d364 100%);
    }
    .treemap-cell-label {
      padding: 4px;
      font-size: 11px;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      word-break: break-all;
    }
    .module-list {
      background: var(--bg-secondary);
      margin: 16px;
      margin-left: 0;
      border-radius: 8px;
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      max-height: 100%;
    }
    .module-list-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
      font-weight: 600;
      font-size: 14px;
    }
    .module-table-wrapper {
      overflow: auto;
      flex: 1;
    }
    .module-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .module-table th {
      position: sticky;
      top: 0;
      background: var(--bg-tertiary);
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
      color: var(--text-secondary);
      cursor: pointer;
      white-space: nowrap;
    }
    .module-table th:hover { color: var(--text-primary); }
    .module-table td {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border);
    }
    .module-table tr:hover td { background: var(--bg-tertiary); }
    .module-table tr.clickable { cursor: pointer; }
    .module-name {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .size-bar {
      height: 4px;
      background: var(--bg-tertiary);
      border-radius: 2px;
      overflow: hidden;
      margin-top: 4px;
    }
    .size-bar-fill {
      height: 100%;
      background: var(--accent);
      transition: width 0.3s;
    }
    .percentage { color: var(--text-secondary); font-size: 12px; }
    .large-badge {
      background: var(--danger);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      margin-left: 8px;
    }
    .detail-panel {
      position: fixed;
      right: -400px;
      top: 0;
      width: 400px;
      height: 100vh;
      background: var(--bg-secondary);
      border-left: 1px solid var(--border);
      transition: right 0.3s;
      z-index: 100;
      display: flex;
      flex-direction: column;
    }
    .detail-panel.open { right: 0; }
    .detail-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .detail-header h3 { font-size: 14px; }
    .detail-close {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 20px;
      cursor: pointer;
    }
    .detail-content {
      padding: 16px;
      overflow: auto;
      flex: 1;
    }
    .detail-section {
      margin-bottom: 20px;
    }
    .detail-section h4 {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .detail-value {
      font-size: 14px;
      word-break: break-all;
    }
    .import-chain {
      background: var(--bg-tertiary);
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      font-family: monospace;
    }
    .import-chain-item {
      padding: 4px 0;
      color: var(--text-secondary);
    }
    .import-chain-item::before {
      content: "→ ";
      color: var(--accent);
    }
    .packages-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .package-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: var(--bg-tertiary);
      border-radius: 6px;
    }
    .package-name { font-weight: 500; }
    .package-size { color: var(--text-secondary); font-size: 13px; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .zoom-controls {
      position: absolute;
      bottom: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
      z-index: 20;
    }
    .zoom-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--bg-tertiary);
      border: 1px solid var(--border);
      color: var(--text-primary);
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .zoom-btn:hover { background: var(--border); }
    .breadcrumb {
      padding: 8px 16px;
      background: var(--bg-tertiary);
      font-size: 13px;
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .breadcrumb-item {
      color: var(--text-secondary);
      cursor: pointer;
    }
    .breadcrumb-item:hover { color: var(--accent); }
    .breadcrumb-item::after { content: " /"; color: var(--border); margin-left: 8px; }
    .breadcrumb-item:last-child::after { display: none; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📦 Bundle Analyzer</h1>
    <span class="badge">Jen.js</span>
  </div>

  <div class="stats-bar">
    <div class="stat">
      <span class="stat-label">Total Size</span>
      <span class="stat-value" id="totalSize">${formatBytes(analysis.totalSize)}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Gzipped</span>
      <span class="stat-value" id="gzipSize">${formatBytes(analysis.totalGzipSize)}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Modules</span>
      <span class="stat-value" id="moduleCount">${analysis.modules.length}</span>
    </div>
    <div class="stat">
      <span class="stat-label">Packages</span>
      <span class="stat-value" id="packageCount">${analysis.packages.size}</span>
    </div>
    ${
      analysis.duplicateModules.size > 0
        ? `
    <div class="stat">
      <span class="stat-label">Duplicates</span>
      <span class="stat-value" style="color: var(--warning)">${analysis.duplicateModules.size}</span>
    </div>
    `
        : ""
    }
  </div>

  <div class="controls">
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="Search modules...">
    </div>
    <div class="toggle-group">
      <button class="btn active" data-view="treemap">Treemap</button>
      <button class="btn" data-view="table">Table</button>
      <button class="btn" data-view="packages">Packages</button>
    </div>
    <div class="toggle-group">
      <button class="btn active" data-size="raw">Raw</button>
      <button class="btn" data-size="gzip">Gzip</button>
    </div>
  </div>

  <div class="main-content">
    <div class="treemap-container" id="treemapContainer">
      <div class="treemap-header">Bundle Treemap</div>
      <div class="breadcrumb" id="breadcrumb"></div>
      <div id="treemap"></div>
      <div class="zoom-controls">
        <button class="zoom-btn" id="zoomIn">+</button>
        <button class="zoom-btn" id="zoomOut">−</button>
        <button class="zoom-btn" id="zoomReset">↺</button>
      </div>
    </div>

    <div class="module-list" id="tableContainer" style="display: none;">
      <div class="module-list-header">All Modules</div>
      <div class="module-table-wrapper">
        <table class="module-table">
          <thead>
            <tr>
              <th data-sort="name">Module</th>
              <th data-sort="size" data-dir="desc">Size</th>
              <th data-sort="gzipSize">Gzip</th>
              <th data-sort="percentage" data-dir="desc">%</th>
            </tr>
          </thead>
          <tbody id="moduleTableBody"></tbody>
        </table>
      </div>
    </div>

    <div class="module-list" id="packagesContainer" style="display: none;">
      <div class="module-list-header">Bundle Composition by Package</div>
      <div class="module-table-wrapper">
        <div class="packages-list" id="packagesList"></div>
      </div>
    </div>
  </div>

  <div class="detail-panel" id="detailPanel">
    <div class="detail-header">
      <h3>Module Details</h3>
      <button class="detail-close" id="detailClose">×</button>
    </div>
    <div class="detail-content">
      <div class="detail-section">
        <h4>Path</h4>
        <div class="detail-value" id="detailPath"></div>
      </div>
      <div class="detail-section">
        <h4>Size</h4>
        <div class="detail-value" id="detailSize"></div>
      </div>
      <div class="detail-section">
        <h4>Gzipped</h4>
        <div class="detail-value" id="detailGzip"></div>
      </div>
      <div class="detail-section">
        <h4>Percentage</h4>
        <div class="detail-value" id="detailPercentage"></div>
      </div>
      <div class="detail-section">
        <h4>Package</h4>
        <div class="detail-value" id="detailPackage"></div>
      </div>
    </div>
  </div>

  <script>
    const modules = ${modulesJson};
    const treemapData = ${treemapJson};
    const packagesData = ${packagesJson};
    const duplicatesData = ${duplicatesJson};

    let currentView = 'treemap';
    let currentSize = 'raw';
    let currentSort = { field: 'size', dir: 'desc' };
    let treemapZoom = 1;
    let treemapOffset = { x: 0, y: 0 };
    let currentTreemapNode = treemapData;
    let treemapHistory = [treemapData];

    function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function getSize(m) {
      return currentSize === 'gzip' ? m.gzipSize : m.size;
    }

    function sortModules(mods) {
      return [...mods].sort((a, b) => {
        const aVal = currentSort.field === 'name' ? a[currentSort.field] : getSize(a);
        const bVal = currentSort.field === 'name' ? b[currentSort.field] : getSize(b);
        const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return currentSort.dir === 'desc' ? -cmp : cmp;
      });
    }

    function renderTable(filteredModules) {
      const sorted = sortModules(filteredModules);
      const tbody = document.getElementById('moduleTableBody');
      tbody.innerHTML = sorted.map(m => {
        const size = getSize(m);
        const pct = (size / ${analysis.totalSize}) * 100;
        return \`<tr class="clickable" data-path="\${escapeHtml(m.path)}">
          <td class="module-name">\${escapeHtml(m.name)}<span class="path-hint" style="color: var(--text-secondary); font-size: 11px;">\${escapeHtml(m.path.replace(m.name, ''))}</span>\${m.isLarge ? '<span class="large-badge">LARGE</span>' : ''}</td>
          <td>\${formatBytes(m.size)}<div class="size-bar"><div class="size-bar-fill" style="width: \${Math.min(pct * 10, 100)}%"></div></div></td>
          <td>\${formatBytes(m.gzipSize)}</td>
          <td class="percentage">\${pct.toFixed(2)}%</td>
        </tr>\`;
      }).join('');

      tbody.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', () => showDetail(row.dataset.path));
      });
    }

    function renderPackages() {
      const list = document.getElementById('packagesList');
      const sorted = Object.entries(packagesData).sort((a, b) => b[1].size - a[1].size);
      list.innerHTML = sorted.map(([name, data]) => {
        const pct = (data.size / ${analysis.totalSize}) * 100;
        return \`<div class="package-item">
          <span class="package-name">\${escapeHtml(name)}</span>
          <span class="package-size">\${formatBytes(data.size)} (\${pct.toFixed(1)}%)</span>
        </div>\`;
      }).join('');
    }

    function renderTreemap(node) {
      const container = document.getElementById('treemap');
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      container.innerHTML = '';

      if (!node.children || node.children.length === 0) return;

      const totalValue = node.children.reduce((sum, c) => sum + getSize(c), 0);
      
      const rows = [];
      let currentRow = [];
      let currentRowHeight = 0;
      
      for (const child of node.children) {
        const size = getSize(child);
        const childHeight = (size / totalValue) * height;
        
        if (childHeight > 50 || currentRowHeight < 50) {
          if (currentRow.length > 0 && Math.abs(childHeight - currentRowHeight) > currentRowHeight * 0.5) {
            rows.push(currentRow);
            currentRow = [];
          }
          currentRow.push(child);
          currentRowHeight = childHeight;
        } else {
          currentRow.push(child);
        }
      }
      if (currentRow.length > 0) rows.push(currentRow);

      let y = 0;
      rows.forEach(row => {
        const rowTotal = row.reduce((sum, c) => sum + getSize(c), 0);
        const rowHeight = Math.max(30, (rowTotal / totalValue) * height * 0.9);
        
        let x = 0;
        row.forEach(child => {
          const size = getSize(child);
          const cellWidth = (size / rowTotal) * width;
          const cellHeight = rowHeight;
          
          const el = document.createElement('div');
          el.className = 'treemap-cell';
          
          let cellClass = 'small';
          if (child.isLarge || (child.value && child.value > 50000)) cellClass = 'large';
          else if (child.value && child.value > 20000) cellClass = 'medium';
          if (child.package === 'local' || (!child.package && child.path && !child.path.includes('node_modules'))) cellClass = 'local';
          
          el.classList.add(cellClass);
          el.style.left = (x * treemapZoom + treemapOffset.x) + 'px';
          el.style.top = (y * treemapZoom + treemapOffset.y) + 'px';
          el.style.width = (cellWidth * treemapZoom - 2) + 'px';
          el.style.height = (cellHeight * treemapZoom - 2) + 'px';
          
          const label = document.createElement('div');
          label.className = 'treemap-cell-label';
          label.textContent = child.name.length > 20 ? child.name.slice(0, 17) + '...' : child.name;
          el.appendChild(label);
          
          el.addEventListener('click', () => {
            if (child.children && child.children.length > 0) {
              treemapHistory.push(child);
              currentTreemapNode = child;
              renderTreemap(child);
              updateBreadcrumb();
            } else {
              showDetail(child.path);
            }
          });
          
          container.appendChild(el);
          x += cellWidth;
        });
        y += rowHeight;
      });

      updateBreadcrumb();
    }

    function updateBreadcrumb() {
      const breadcrumb = document.getElementById('breadcrumb');
      breadcrumb.innerHTML = treemapHistory.map((node, i) => {
        const isLast = i === treemapHistory.length - 1;
        return \`<span class="breadcrumb-item" data-index="\${i}">\${node.name}\${isLast ? '' : '/'}</span>\`;
      }).join('');

      breadcrumb.querySelectorAll('.breadcrumb-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.index);
          treemapHistory = treemapHistory.slice(0, idx + 1);
          currentTreemapNode = treemapHistory[treemapHistory.length - 1];
          renderTreemap(currentTreemapNode);
        });
      });
    }

    function showDetail(path) {
      const m = modules.find(mod => mod.path === path);
      if (!m) return;

      document.getElementById('detailPath').textContent = m.path;
      document.getElementById('detailSize').textContent = formatBytes(m.size);
      document.getElementById('detailGzip').textContent = formatBytes(m.gzipSize);
      document.getElementById('detailPercentage').textContent = m.percentage.toFixed(2) + '%';
      document.getElementById('detailPackage').textContent = m.package || 'unknown';

      document.getElementById('detailPanel').classList.add('open');
    }

    document.getElementById('detailClose').addEventListener('click', () => {
      document.getElementById('detailPanel').classList.remove('open');
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = modules.filter(m => 
        m.path.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
      );
      
      if (currentView === 'table') {
        renderTable(filtered);
      }
    });

    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentView = btn.dataset.view;
        
        document.getElementById('treemapContainer').style.display = currentView === 'treemap' ? 'block' : 'none';
        document.getElementById('tableContainer').style.display = currentView === 'table' ? 'flex' : 'none';
        document.getElementById('packagesContainer').style.display = currentView === 'packages' ? 'flex' : 'none';
        
        if (currentView === 'table') renderTable(modules);
        if (currentView === 'packages') renderPackages();
      });
    });

    document.querySelectorAll('[data-size]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-size]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSize = btn.dataset.size;
        
        document.getElementById('totalSize').textContent = formatBytes(${analysis.totalSize});
        document.getElementById('gzipSize').textContent = formatBytes(${analysis.totalGzipSize});
        
        if (currentView === 'treemap') renderTreemap(currentTreemapNode);
        if (currentView === 'table') renderTable(modules);
      });
    });

    document.querySelectorAll('.module-table th').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (currentSort.field === field) {
          currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.field = field;
          currentSort.dir = 'desc';
        }
        renderTable(modules);
      });
    });

    document.getElementById('zoomIn').addEventListener('click', () => {
      treemapZoom = Math.min(treemapZoom * 1.2, 5);
      renderTreemap(currentTreemapNode);
    });

    document.getElementById('zoomOut').addEventListener('click', () => {
      treemapZoom = Math.max(treemapZoom / 1.2, 0.5);
      renderTreemap(currentTreemapNode);
    });

    document.getElementById('zoomReset').addEventListener('click', () => {
      treemapZoom = 1;
      treemapOffset = { x: 0, y: 0 };
      currentTreemapNode = treemapData;
      treemapHistory = [treemapData];
      renderTreemap(currentTreemapNode);
    });

    renderTreemap(treemapData);
  </script>
</body>
</html>`;

  return minifyHtml(html);
}

export async function runBundleAnalyzer(
  config: FrameworkConfig,
): Promise<string> {
  const dist = resolveDistPath(config);
  const reportPath = join(dist, "bundle-report.html");

  const htmlContent = await generateBundleReport(config);
  writeFileSync(reportPath, htmlContent, "utf-8");

  log.info(`Bundle report generated: ${reportPath}`);
  return reportPath;
}
