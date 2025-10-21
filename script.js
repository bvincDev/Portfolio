// script.js — accessible navigation and GitHub repo loader

const username = "bvincDev"; // git
let reposLoaded = false;

document.addEventListener("DOMContentLoaded", () => {
  // wire up nav links and page switching (no inline onclicks)
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const page = el.dataset.page;
      showPage(page);
      // close mobile nav if open
      document.getElementById('primary-nav').classList.remove('open');
      document.getElementById('nav-toggle').setAttribute('aria-expanded', 'false');
    });
  });

  // hamburger toggle
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  navToggle.addEventListener('click', () => {
    const open = primaryNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // initialize on home
  showPage('home');

  // keyboard accessibility: close nav with Escape
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      primaryNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

function showPage(pageId) {
  // hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.setAttribute('hidden', '');
  });

  const page = document.getElementById(pageId);
  if (!page) return;
  page.classList.add('active');
  page.removeAttribute('hidden');

  // nav highlight logic...
  document.querySelectorAll('[data-page]').forEach(el => el.removeAttribute('aria-current'));
  document.querySelectorAll('.nav-link').forEach(a => a.classList.remove('active'));
  const link = Array.from(document.querySelectorAll('.nav-link')).find(a => a.dataset.page === pageId);
  if (link) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }

  // Load repos only once when visiting Projects
  if (pageId === 'projects' && !reposLoaded) {
    loadGitHubRepos();
    reposLoaded = true;
  }
}

/* ===== GitHub fetch & rendering (limited to a few repos) ===== */
async function loadGitHubRepos(){
  const repoContainer = document.getElementById('repo-list');
  repoContainer.innerHTML = `<p class="muted">Loading repositories...</p>`;

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`);
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Unexpected response');

    // filter out forks, sort by updated_at desc, take first 8
    const repos = data
      .filter(r => !r.fork)
      .sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 8);

    if (repos.length === 0) {
      repoContainer.innerHTML = `<p class="muted">No public repositories found.</p>`;
      return;
    }

    repoContainer.innerHTML = '';
    repos.forEach(r => {
      const card = document.createElement('article');
      card.className = 'repo-card';
      const desc = r.description ? sanitizeText(r.description) : 'No description.';
      const stars = r.stargazers_count || 0;
      const lang = r.language || '—';
      card.innerHTML = `
        <h3><a href="${r.html_url}" target="_blank" rel="noopener noreferrer">${escapeHtml(r.name)}</a></h3>
        <p>${truncate(desc, 140)}</p>
        <div class="repo-meta">
          <span class="badge">★ ${stars}</span>
          <span class="badge">${lang}</span>
          <span style="margin-left:auto; color:var(--muted); font-size:0.85rem;">Updated ${timeSince(new Date(r.updated_at))} ago</span>
        </div>
      `;
      repoContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    repoContainer.innerHTML = `<p style="color:#ffb4b4">Failed to load repositories. Check console for details.</p>`;
  }
}

/* helpers */
function timeSince(date){
  const sec = Math.floor((Date.now() - date.getTime())/1000);
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec/60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m/60);
  if (h < 48) return `${h}h`;
  const d = Math.floor(h/24);
  return `${d}d`;
}
function truncate(s, n){
  if (s.length <= n) return s;
  return s.slice(0,n-1) + '…';
}
function escapeHtml(str){
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]));
}
function sanitizeText(s){
  // minimal sanitization: strip tags
  return s.replace(/<\/?[^>]+(>|$)/g, "");
}
