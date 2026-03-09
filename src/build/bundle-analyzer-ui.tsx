import { renderToString } from "preact-render-to-string";
import type { BundleModule, BundleAnalysis, TreemapNode } from "./bundle-analyzer.js";

interface Props {
  analysis: BundleAnalysis;
  treemap: TreemapNode;
}

const styles = `
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg-primary:#0d1117;--bg-secondary:#161b22;--bg-tertiary:#21262d;--border:#30363d;--text-primary:#e6edf3;--text-secondary:#8b949e;--accent:#58a6ff;--accent-hover:#79c0ff;--danger:#f85149;--warning:#d29922;--success:#3fb950}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg-primary);color:var(--text-primary);min-height:100vh}
.header{background:var(--bg-secondary);border-bottom:1px solid var(--border);padding:16px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
.header h1{font-size:20px;font-weight:600}
.header .badge{background:var(--accent);color:var(--bg-primary);padding:4px 12px;border-radius:12px;font-size:12px;font-weight:600}
.stats-bar{display:flex;gap:24px;padding:16px 24px;background:var(--bg-secondary);border-bottom:1px solid var(--border);flex-wrap:wrap}
.stat{display:flex;flex-direction:column;gap:4px}
.stat-label{font-size:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.5px}
.stat-value{font-size:20px;font-weight:600}
.controls{display:flex;gap:12px;padding:16px 24px;border-bottom:1px solid var(--border);flex-wrap:wrap;align-items:center}
.search-box{flex:1;min-width:200px;max-width:400px;position:relative}
.search-box input{width:100%;padding:8px 12px 8px 36px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);font-size:14px}
.search-box input:focus{outline:none;border-color:var(--accent)}
.btn{padding:8px 16px;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);font-size:13px;cursor:pointer;transition:all .15s}
.btn:hover{background:var(--border)}
.btn.active{background:var(--accent);border-color:var(--accent);color:var(--bg-primary)}
.toggle-group{display:flex;gap:4px;background:var(--bg-tertiary);border-radius:6px;padding:4px}
.treemap-container{background:var(--bg-secondary);margin:16px;border-radius:8px;border:1px solid var(--border);overflow:hidden;position:relative;flex:1;min-height:400px}
.treemap-header{padding:12px 16px;border-bottom:1px solid var(--border);font-weight:600;font-size:14px}
#treemap{width:100%;height:calc(100% - 45px);position:relative}
.treemap-cell{position:absolute;border:1px solid var(--bg-primary);overflow:hidden;cursor:pointer;transition:transform .1s,box-shadow .1s}
.treemap-cell:hover{z-index:10;box-shadow:0 4px 12px rgba(0,0,0,.5)}
.treemap-cell.large{background:linear-gradient(135deg,var(--danger) 0%,#ff6b6b 100%)}
.treemap-cell.medium{background:linear-gradient(135deg,var(--warning) 0%,#ffd43b 100%)}
.treemap-cell.small{background:linear-gradient(135deg,var(--accent) 0%,#79c0ff 100%)}
.treemap-cell.local{background:linear-gradient(135deg,var(--success) 0%,#56d364 100%)}
.treemap-cell-label{padding:4px;font-size:11px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.5);word-break:break-all}
.module-list{background:var(--bg-secondary);margin:16px;margin-left:0;border-radius:8px;border:1px solid var(--border);display:flex;flex-direction:column;max-height:600px}
.module-table-wrapper{overflow:auto;flex:1}
.module-table{width:100%;border-collapse:collapse;font-size:13px}
.module-table th{position:sticky;top:0;background:var(--bg-tertiary);padding:10px 12px;text-align:left;font-weight:600;color:var(--text-secondary);cursor:pointer;white-space:nowrap}
.module-table th:hover{color:var(--text-primary)}
.module-table td{padding:8px 12px;border-bottom:1px solid var(--border)}
.module-table tr:hover td{background:var(--bg-tertiary)}
.module-name{max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.size-bar{height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;margin-top:4px}
.size-bar-fill{height:100%;background:var(--accent);transition:width .3s}
.large-badge{background:var(--danger);color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;margin-left:8px}
.packages-list{display:flex;flex-direction:column;gap:8px}
.package-item{display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg-tertiary);border-radius:6px}
.detail-panel{position:fixed;right:-400px;top:0;width:400px;height:100vh;background:var(--bg-secondary);border-left:1px solid var(--border);transition:right .3s;z-index:100;display:flex;flex-direction:column}
.detail-panel.open{right:0}
.detail-header{padding:16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.detail-close{background:0;border:none;color:var(--text-secondary);font-size:20px;cursor:pointer}
.detail-content{padding:16px;overflow:auto;flex:1}
.detail-section{margin-bottom:20px}
.detail-section h4{font-size:12px;color:var(--text-secondary);text-transform:uppercase;margin-bottom:8px}
.detail-value{font-size:14px;word-break:break-all}
.zoom-controls{position:absolute;bottom:16px;right:16px;display:flex;gap:8px;z-index:20}
.zoom-btn{width:36px;height:36px;border-radius:50%;background:var(--bg-tertiary);border:1px solid var(--border);color:var(--text-primary);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.zoom-btn:hover{background:var(--border)}
.breadcrumb{padding:8px 16px;background:var(--bg-tertiary);font-size:13px;display:flex;gap:8px;align-items:center}
.breadcrumb-item{color:var(--text-secondary);cursor:pointer}
.breadcrumb-item:hover{color:var(--accent)}
.main-content{display:flex;gap:16px;padding:0 16px 16px 0}
`;

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div class="stat">
      <span class="stat-label">{label}</span>
      <span class="stat-value">{value}</span>
    </div>
  );
}

function Header() {
  return (
    <div class="header">
      <h1>Bundle Analyzer</h1>
      <span class="badge">Jen.js</span>
    </div>
  );
}

function StatsBar({ analysis }: { analysis: BundleAnalysis }) {
  return (
    <div class="stats-bar">
      <StatCard label="Total Size" value={formatBytes(analysis.totalSize)} />
      <StatCard label="Gzipped" value={formatBytes(analysis.totalGzipSize)} />
      <StatCard label="Modules" value={String(analysis.modules.length)} />
      <StatCard label="Packages" value={String(analysis.packages.size)} />
    </div>
  );
}

function ModuleRow({ module, totalSize }: { module: BundleModule; totalSize: number }) {
  const pct = totalSize > 0 ? (module.size / totalSize) * 100 : 0;
  return (
    <tr data-path={module.path}>
      <td class="module-name">
        {escapeHtml(module.name)}
        {module.isLarge && <span class="large-badge">LARGE</span>}
      </td>
      <td>{formatBytes(module.size)}<div class="size-bar"><div class="size-bar-fill" style={{ width: `${Math.min(pct * 10, 100)}%` }}></div></div></td>
      <td>{formatBytes(module.gzipSize)}</td>
      <td>{pct.toFixed(2)}%</td>
    </tr>
  );
}

function ModuleTable({ modules, totalSize }: { modules: BundleModule[]; totalSize: number }) {
  const sorted = [...modules].sort((a, b) => b.size - a.size);
  return (
    <div class="module-list" style={{ flex: 1, maxHeight: "none", margin: "16px 16px 16px 0" }}>
      <div class="treemap-header">All Modules</div>
      <div class="module-table-wrapper">
        <table class="module-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Size</th>
              <th>Gzip</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(m => <ModuleRow module={m} totalSize={totalSize} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PackageItem({ name, size, totalSize }: { name: string; size: number; totalSize: number }) {
  const pct = totalSize > 0 ? (size / totalSize) * 100 : 0;
  return (
    <div class="package-item">
      <span>{escapeHtml(name)}</span>
      <span>{formatBytes(size)} ({pct.toFixed(1)}%)</span>
    </div>
  );
}

function PackagesView({ packages, totalSize }: { packages: Map<string, { size: number }>; totalSize: number }) {
  const sorted = [...packages.entries()].sort((a, b) => b[1].size - a[1].size);
  return (
    <div class="module-list" style={{ flex: 1, maxHeight: "none", margin: "16px 16px 16px 0" }}>
      <div class="treemap-header">Bundle by Package</div>
      <div class="module-table-wrapper">
        <div class="packages-list">
          {sorted.map(([name, data]) => <PackageItem name={name} size={data.size} totalSize={totalSize} />)}
        </div>
      </div>
    </div>
  );
}

export function BundleReport({ analysis, treemap }: Props) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bundle Analyzer - Jen.js</title>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        <Header />
        <StatsBar analysis={analysis} />
        <div class="main-content">
          <div class="treemap-container">
            <div class="treemap-header">Bundle Treemap</div>
            <div id="treemap" data-treemap={JSON.stringify(treemap)}></div>
            <div class="zoom-controls">
              <button class="zoom-btn" data-action="zoomIn">+</button>
              <button class="zoom-btn" data-action="zoomOut">−</button>
              <button class="zoom-btn" data-action="zoomReset">↺</button>
            </div>
          </div>
          <ModuleTable modules={analysis.modules} totalSize={analysis.totalSize} />
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
        <script dangerouslySetInnerHTML={{ __html: `
const modules=${JSON.stringify(analysis.modules)};
const treemapData=${JSON.stringify(treemap)};
let currentSize='raw';
let treemapZoom=1;
let currentNode=treemapData;
let history=[treemapData];

function getSize(m){return currentSize==='gzip'?m.gzipSize:m.size}

function renderTreemap(node){
const container=document.getElementById('treemap');
const rect=container.getBoundingClientRect();
const w=rect.width,h=rect.height;
container.innerHTML='';
if(!node.children||node.children.length===0)return;
const total=node.children.reduce((s,c)=>s+getSize(c),0);
const rows=[];
let row=[],rowH=0;
for(const child of node.children){
const sz=getSize(child);
const ch=(sz/total)*h;
if(ch>50||rowH<50){if(row.length>0&&Math.abs(ch-rowH)>rowH*.5){rows.push(row);row=[];}
row.push(child);rowH=ch;
}else{row.push(ch);}
}
if(row.length>0)rows.push(row);
let y=0;
rows.forEach(r=>{
const rt=r.reduce((s,c)=>s+getSize(c),0);
const rh=Math.max(30,(rt/total)*h*.9);
let x=0;
r.forEach(c=>{
const sz=getSize(c);
const cw=(sz/rt)*w,ch=rh;
const el=document.createElement('div');
el.className='treemap-cell '+(c.isLarge||c.value>50000?'large':c.value>20000?'medium':'small');
if(c.package==='local'||!c.path.includes('node_modules'))el.className='treemap-cell local';
el.style.left=x+'px';
el.style.top=y+'px';
el.style.width=(cw-2)+'px';
el.style.height=(ch-2)+'px';
el.innerHTML='<div class="treemap-cell-label">'+(c.name.length>15?c.name.slice(0,12)+'...':c.name)+'</div>';
el.onclick=()=>{if(c.children&&c.children.length>0){history.push(c);currentNode=c;renderTreemap(c);}else showDetail(c.path);};
container.appendChild(el);
x+=cw;
});
y+=rh;
});
}

function showDetail(p){
const m=modules.find(x=>x.path===p);
if(!m)return;
document.getElementById('detailPath').textContent=m.path;
document.getElementById('detailSize').textContent=formatBytes(m.size);
document.getElementById('detailGzip').textContent=formatBytes(m.gzipSize);
document.getElementById('detailPercentage').textContent=m.percentage.toFixed(2)+'%';
document.getElementById('detailPackage').textContent=m.package||'unknown';
document.getElementById('detailPanel').classList.add('open');
}

function formatBytes(b){if(b===0)return'0 B';const k=1024,s=['B','KB','MB','GB'];return parseFloat((b/Math.pow(k,Math.floor(Math.log(b)/Math.log(k)))).toFixed(2))+' '+s[Math.floor(Math.log(b)/Math.log(k))];}

document.getElementById('detailClose').onclick=()=>document.getElementById('detailPanel').classList.remove('open');
document.querySelectorAll('.zoom-btn').forEach(b=>{
b.onclick=()=>{
if(b.dataset.action==='zoomIn')treemapZoom=Math.min(treemapZoom*1.2,5);
if(b.dataset.action==='zoomOut')treemapZoom=Math.max(treemapZoom/1.2,.5);
if(b.dataset.action==='zoomReset'){treemapZoom=1;currentNode=treemapData;history=[treemapData];}
renderTreemap(currentNode);
};
});
document.querySelectorAll('.module-table tr[data-path]').forEach(r=>r.onclick=()=>showDetail(r.dataset.path));
renderTreemap(treemapData);
` }} />
      </body>
    </html>
  );
}
