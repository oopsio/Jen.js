// Import data from data.js
import { docsData } from './data.js';
import "./marked.min.js";
import "https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-sans/style.css";
import "https://cdn.jsdelivr.net/npm/geist@1.0.0/dist/fonts/geist-mono/style.css";
import "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css";
import "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css";


import "./prism.min.js";
import "./prism-typescript.min.js";
import "./prism-bash.min.js";
import "./prism-json.min.js";
import "./prism-tsx.min.js";

// =========================================================================
// APPLICATION LOGIC
// =========================================================================

// State
let currentTheme = localStorage.getItem('theme') || 'dark';

// DOM Elements
const sidebar = document.getElementById('nav-tree');
const markdownViewer = document.getElementById('markdown-viewer');
const tocList = document.getElementById('toc-list');
const breadcrumbs = document.getElementById('breadcrumbs');
const pageNav = document.getElementById('page-nav');
const searchInput = document.getElementById('search-input');
const modalSearchInput = document.getElementById('modal-search-input');
const searchModal = document.getElementById('search-modal');
const searchResults = document.getElementById('search-results');

// Initialize
function init() {
  setTheme(currentTheme);
  renderSidebar();

  // Route handling
  const path = window.location.hash.slice(1) || 'introduction';
  loadPage(path);

  // Event Listeners
  window.addEventListener('hashchange', () => loadPage(window.location.hash.slice(1)));

  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Search Shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchModal.classList.remove('hidden');
      modalSearchInput.focus();
    }
    if (e.key === 'Escape') searchModal.classList.add('hidden');
  });

  searchInput.addEventListener('focus', () => {
    searchModal.classList.remove('hidden');
    modalSearchInput.focus();
  });

  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) searchModal.classList.add('hidden');
  });

  modalSearchInput.addEventListener('input', handleSearch);

  // Mobile Menu
  const mobileBtn = document.getElementById('mobile-menu-btn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }
}

// ------------------------------------------
// Navigation & Rendering
// ------------------------------------------

function renderSidebar() {
  const categories = {};

  // Group pages by category
  Object.keys(docsData).forEach(key => {
    const page = docsData[key];
    if (!categories[page.category]) categories[page.category] = [];
    categories[page.category].push({ key, title: page.title });
  });

  // Define category order
  const categoryOrder = [
    "Introduction",
    "Getting Started",
    "Core Concepts",
    "Architecture",
    "Configuration",
    "API Reference",
    "Advanced",
    "Troubleshooting"
  ];

  let html = '';
  categoryOrder.forEach(cat => {
    if (categories[cat]) {
      html += `<div class="nav-group">
                <div class="nav-group-title">${cat}</div>
                ${categories[cat].map(p => `
                    <a href="#${p.key}" class="nav-link" id="link-${p.key}">
                        ${p.title}
                    </a>
                `).join('')}
            </div>`;
    }
  });

  sidebar.innerHTML = html;
}

function loadPage(key) {
  if (!docsData[key]) key = 'introduction';

  const page = docsData[key];

  // Update Sidebar Active State
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const activeLink = document.getElementById(`link-${key}`);
  if (activeLink) activeLink.classList.add('active');

  // Breadcrumbs
  breadcrumbs.innerHTML = `
        <span>Docs</span>
        <i class="bi bi-chevron-right chevron"></i>
        <span>${page.category}</span>
        <i class="bi bi-chevron-right chevron"></i>
        <span>${page.title}</span>
    `;

  // Render Markdown (Requires marked.js loaded in HTML)
  markdownViewer.innerHTML = marked.parse(page.content);

  // Syntax Highlight (Requires Prism.js loaded in HTML)
  if (window.Prism) Prism.highlightAll();

  // Generate TOC
  generateTOC();

  // Generate Footer Nav (Next/Prev)
  generatePageNav(key);

  // Close Mobile Menu if open
  document.getElementById('sidebar').classList.remove('open');

  // Scroll to top
  window.scrollTo(0, 0);
}

function generateTOC() {
  const headers = markdownViewer.querySelectorAll('h2, h3');
  let html = '';

  headers.forEach((h, index) => {
    const id = `header-${index}`;
    h.id = id;
    html += `
            <a href="#${id}" class="toc-link" onclick="document.getElementById('${id}').scrollIntoView({behavior: 'smooth'})">
                ${h.innerText}
            </a>
        `;
  });

  tocList.innerHTML = html;
}

function generatePageNav(currentKey) {
  const keys = Object.keys(docsData);
  const index = keys.indexOf(currentKey);
  const prev = index > 0 ? keys[index - 1] : null;
  const next = index < keys.length - 1 ? keys[index + 1] : null;

  let html = '';

  if (prev) {
    html += `
            <a href="#${prev}" class="page-nav-card">
                <span class="page-nav-label">Previous</span>
                <span class="page-nav-title">« ${docsData[prev].title}</span>
            </a>
        `;
  } else {
    html += `<div></div>`; // Spacer
  }

  if (next) {
    html += `
            <a href="#${next}" class="page-nav-card" style="text-align: right;">
                <span class="page-nav-label">Next</span>
                <span class="page-nav-title">${docsData[next].title} »</span>
            </a>
        `;
  }

  pageNav.innerHTML = html;
}

// ------------------------------------------
// Search Logic
// ------------------------------------------

function handleSearch(e) {
  const term = e.target.value.toLowerCase();
  if (term.length < 2) {
    searchResults.innerHTML = '';
    return;
  }

  const results = Object.keys(docsData).filter(key => {
    const page = docsData[key];
    return page.title.toLowerCase().includes(term) || page.content.toLowerCase().includes(term);
  });

  searchResults.innerHTML = results.map(key => {
    const page = docsData[key];
    // Simple snippet extraction
    const snippetIndex = page.content.toLowerCase().indexOf(term);
    const snippet = snippetIndex > -1
      ? page.content.substring(snippetIndex, snippetIndex + 60) + '...'
      : page.content.substring(0, 60) + '...';

    return `
            <div class="search-result-item" onclick="window.location.hash='${key}'; document.getElementById('search-modal').classList.add('hidden')">
                <span class="result-title">${page.title}</span>
                <span class="result-preview">${snippet.replace(/[#*`]/g, '')}</span>
            </div>
        `;
  }).join('');
}

// ------------------------------------------
// Theme Logic
// ------------------------------------------

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(currentTheme);
}

function setTheme(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.className = theme;
  const icon = document.querySelector('#theme-toggle i');
  if (icon) icon.className = theme === 'dark' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
}

// Run
init();