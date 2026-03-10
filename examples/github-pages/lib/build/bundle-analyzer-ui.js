import { jsx as _jsx, jsxs as _jsxs } from "preact/jsx-runtime";
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
function formatBytes(bytes) {
    if (bytes === 0)
        return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function StatCard({ label, value }) {
    return (_jsxs("div", { class: "stat", children: [_jsx("span", { class: "stat-label", children: label }), _jsx("span", { class: "stat-value", children: value })] }));
}
function Header() {
    return (_jsxs("div", { class: "header", children: [_jsx("h1", { children: "Bundle Analyzer" }), _jsx("span", { class: "badge", children: "Jen.js" })] }));
}
function StatsBar({ analysis }) {
    return (_jsxs("div", { class: "stats-bar", children: [_jsx(StatCard, { label: "Total Size", value: formatBytes(analysis.totalSize) }), _jsx(StatCard, { label: "Gzipped", value: formatBytes(analysis.totalGzipSize) }), _jsx(StatCard, { label: "Modules", value: String(analysis.modules.length) }), _jsx(StatCard, { label: "Packages", value: String(analysis.packages.size) })] }));
}
function ModuleRow({ module, totalSize }) {
    const pct = totalSize > 0 ? (module.size / totalSize) * 100 : 0;
    return (_jsxs("tr", { "data-path": module.path, children: [_jsxs("td", { class: "module-name", children: [escapeHtml(module.name), module.isLarge && _jsx("span", { class: "large-badge", children: "LARGE" })] }), _jsxs("td", { children: [formatBytes(module.size), _jsx("div", { class: "size-bar", children: _jsx("div", { class: "size-bar-fill", style: { width: `${Math.min(pct * 10, 100)}%` } }) })] }), _jsx("td", { children: formatBytes(module.gzipSize) }), _jsxs("td", { children: [pct.toFixed(2), "%"] })] }));
}
function ModuleTable({ modules, totalSize }) {
    const sorted = [...modules].sort((a, b) => b.size - a.size);
    return (_jsxs("div", { class: "module-list", style: { flex: 1, maxHeight: "none", margin: "16px 16px 16px 0" }, children: [_jsx("div", { class: "treemap-header", children: "All Modules" }), _jsx("div", { class: "module-table-wrapper", children: _jsxs("table", { class: "module-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Module" }), _jsx("th", { children: "Size" }), _jsx("th", { children: "Gzip" }), _jsx("th", { children: "%" })] }) }), _jsx("tbody", { children: sorted.map(m => _jsx(ModuleRow, { module: m, totalSize: totalSize })) })] }) })] }));
}
function PackageItem({ name, size, totalSize }) {
    const pct = totalSize > 0 ? (size / totalSize) * 100 : 0;
    return (_jsxs("div", { class: "package-item", children: [_jsx("span", { children: escapeHtml(name) }), _jsxs("span", { children: [formatBytes(size), " (", pct.toFixed(1), "%)"] })] }));
}
function PackagesView({ packages, totalSize }) {
    const sorted = [...packages.entries()].sort((a, b) => b[1].size - a[1].size);
    return (_jsxs("div", { class: "module-list", style: { flex: 1, maxHeight: "none", margin: "16px 16px 16px 0" }, children: [_jsx("div", { class: "treemap-header", children: "Bundle by Package" }), _jsx("div", { class: "module-table-wrapper", children: _jsx("div", { class: "packages-list", children: sorted.map(([name, data]) => _jsx(PackageItem, { name: name, size: data.size, totalSize: totalSize })) }) })] }));
}
export function BundleReport({ analysis, treemap }) {
    return (_jsxs("html", { lang: "en", children: [_jsxs("head", { children: [_jsx("meta", { charset: "UTF-8" }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }), _jsx("title", { children: "Bundle Analyzer - Jen.js" }), _jsx("style", { dangerouslySetInnerHTML: { __html: styles } })] }), _jsxs("body", { children: [_jsx(Header, {}), _jsx(StatsBar, { analysis: analysis }), _jsxs("div", { class: "main-content", children: [_jsxs("div", { class: "treemap-container", children: [_jsx("div", { class: "treemap-header", children: "Bundle Treemap" }), _jsx("div", { id: "treemap", "data-treemap": JSON.stringify(treemap) }), _jsxs("div", { class: "zoom-controls", children: [_jsx("button", { class: "zoom-btn", "data-action": "zoomIn", children: "+" }), _jsx("button", { class: "zoom-btn", "data-action": "zoomOut", children: "\u2212" }), _jsx("button", { class: "zoom-btn", "data-action": "zoomReset", children: "\u21BA" })] })] }), _jsx(ModuleTable, { modules: analysis.modules, totalSize: analysis.totalSize })] }), _jsxs("div", { class: "detail-panel", id: "detailPanel", children: [_jsxs("div", { class: "detail-header", children: [_jsx("h3", { children: "Module Details" }), _jsx("button", { class: "detail-close", id: "detailClose", children: "\u00D7" })] }), _jsxs("div", { class: "detail-content", children: [_jsxs("div", { class: "detail-section", children: [_jsx("h4", { children: "Path" }), _jsx("div", { class: "detail-value", id: "detailPath" })] }), _jsxs("div", { class: "detail-section", children: [_jsx("h4", { children: "Size" }), _jsx("div", { class: "detail-value", id: "detailSize" })] }), _jsxs("div", { class: "detail-section", children: [_jsx("h4", { children: "Gzipped" }), _jsx("div", { class: "detail-value", id: "detailGzip" })] }), _jsxs("div", { class: "detail-section", children: [_jsx("h4", { children: "Percentage" }), _jsx("div", { class: "detail-value", id: "detailPercentage" })] }), _jsxs("div", { class: "detail-section", children: [_jsx("h4", { children: "Package" }), _jsx("div", { class: "detail-value", id: "detailPackage" })] })] })] }), _jsx("script", { dangerouslySetInnerHTML: { __html: `
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
` } })] })] }));
}
