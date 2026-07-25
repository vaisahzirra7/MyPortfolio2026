document.getElementById('year').textContent = new Date().getFullYear();

// --- Boot screen intro ---
(function initBootScreen() {
  const boot = document.getElementById('bootScreen');
  const linesEl = document.getElementById('bootLines');
  if (!boot || !linesEl) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    boot.style.display = 'none';
    return;
  }

  document.body.style.overflow = 'hidden';

  const lines = [
    { text: 'connecting to zvp-secure-net...', delay: 140 },
    { text: '[OK] handshake established', delay: 210, cls: 'boot-line--ok' },
    { text: '[OK] verifying credentials: vaisah.zirra', delay: 230, cls: 'boot-line--ok' },
    { text: '[OK] decrypting portfolio payload', delay: 210, cls: 'boot-line--ok' },
    { text: '[OK] loading modules: projects, research, credentials', delay: 230, cls: 'boot-line--ok' },
    { text: '[OK] integrity check passed — SHA-256 verified', delay: 230, cls: 'boot-line--ok' },
    { text: '', delay: 160 },
    { text: 'ACCESS GRANTED', delay: 280, cls: 'boot-line--bright' },
    { text: 'welcome, Zirra Vaisah Peter.', delay: 260, cls: 'boot-line--dim' },
    { text: 'launching interface...', delay: 450, cls: 'boot-line--dim' },
  ];

  let i = 0;
  let finished = false;

  function hideBoot() {
    if (finished) return;
    finished = true;
    boot.classList.add('is-hidden');
    document.body.style.overflow = '';
    setTimeout(() => { boot.style.display = 'none'; }, 550);
  }

  function nextLine() {
    if (finished) return;
    if (i >= lines.length) {
      setTimeout(hideBoot, 400);
      return;
    }
    const line = lines[i];
    const div = document.createElement('div');
    div.className = `boot-line ${line.cls || ''}`;
    div.textContent = line.text || '\u00A0';
    linesEl.appendChild(div);
    i++;
    setTimeout(nextLine, line.delay);
  }

  boot.addEventListener('click', hideBoot);
  window.addEventListener('keydown', hideBoot, { once: true });

  nextLine();
})();

// --- Hidden admin trigger: click the © symbol 7 times ---
(function initSecretAdmin() {
  const trigger = document.getElementById('secretAdmin');
  if (!trigger) return;
  let count = 0;
  let resetTimer = null;
  trigger.addEventListener('click', () => {
    count++;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { count = 0; }, 1500);
    if (count >= 7) {
      window.location.href = '/admin';
    }
  });
})();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav__links');
navToggle.addEventListener('click', () => navLinks.classList.toggle('is-open'));
navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => navLinks.classList.remove('is-open')));

// Nav scroll shadow + scan-bar scroll progress
const navEl = document.getElementById('nav');
const scanBar = document.getElementById('scanBar');
window.addEventListener('scroll', () => {
  navEl.classList.toggle('is-scrolled', window.scrollY > 8);
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  scanBar.style.width = `${Math.min(100, progress)}%`;
}, { passive: true });

// Scroll-reveal for dynamically rendered content
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function observeReveal(root = document) {
  root.querySelectorAll('.reveal:not(.is-observed)').forEach((el) => {
    el.classList.add('is-observed');
    revealObserver.observe(el);
  });
}

// Reveal static section headers on load
observeReveal();

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

async function loadContent() {
  const res = await fetch('/api/content');
  const data = await res.json();

  renderHero(data.siteInfo);
  renderAbout(data.siteInfo);
  renderSkills(data.skills);
  renderProjects(data.projects);
  renderExperience(data.experience);
  renderResearch(data.research);
  renderCredentials(data.certifications, data.awards);
  renderContactLinks(data.siteInfo);
  observeReveal();
}

function renderHero(info) {
  document.getElementById('heroName').textContent = info.name;
  document.getElementById('heroTitle').textContent = info.title_line;
  document.getElementById('heroTagline').textContent = info.tagline;
  document.title = `${info.name} — ${info.title_line}`;

  const photoImg = document.getElementById('heroPhoto');
  const placeholder = document.getElementById('heroPhotoPlaceholder');
  if (info.photo) {
    photoImg.src = info.photo;
    photoImg.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    photoImg.style.display = 'none';
    placeholder.style.display = 'flex';
  }
}

function renderAbout(info) {
  const el = document.getElementById('aboutText');
  el.innerHTML = (info.about_text || '').split('\n\n').map((p) => `<p>${esc(p)}</p>`).join('');
}

function renderSkills(skills) {
  const categories = [...new Set(skills.map((s) => s.category))];
  const filtersEl = document.getElementById('skillsFilters');
  const gridEl = document.getElementById('skillsGrid');

  filtersEl.innerHTML = `<button class="skills__filter is-active" data-cat="all">All</button>` +
    categories.map((c) => `<button class="skills__filter" data-cat="${esc(c)}">${esc(c)}</button>`).join('');

  gridEl.innerHTML = skills.map((s) =>
    `<span class="skill-chip" data-cat="${esc(s.category)}">${esc(s.name)}</span>`
  ).join('');

  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.skills__filter');
    if (!btn) return;
    filtersEl.querySelectorAll('.skills__filter').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const cat = btn.dataset.cat;

    gridEl.classList.add('is-filtering');
    setTimeout(() => {
      gridEl.querySelectorAll('.skill-chip').forEach((chip) => {
        chip.dataset.hidden = (cat !== 'all' && chip.dataset.cat !== cat) ? 'true' : 'false';
      });
      gridEl.classList.remove('is-filtering');
    }, 160);
  });
}

function renderProjects(projects) {
  const track = document.getElementById('carouselTrack');
  track.innerHTML = projects.map((p, i) => `
    <div class="project-card reveal" style="transition-delay:${(i % 2) * 90}ms">
      <h3 class="project-card__title">${esc(p.title)}</h3>
      <p class="project-card__desc">${esc(p.description)}</p>
      <div class="project-card__tags">
        ${(p.tags || '').split(',').filter(Boolean).map((t) => `<span class="tag">${esc(t.trim())}</span>`).join('')}
      </div>
      ${p.link ? `<a class="project-card__link" href="${esc(p.link)}" target="_blank" rel="noopener">View project →</a>` : ''}
    </div>
  `).join('');

  let index = 0;
  const perView = window.innerWidth >= 700 ? 2 : 1;
  const total = projects.length;
  const totalPages = Math.max(1, total - perView + 1);

  document.getElementById('carouselTotal').textContent = String(totalPages).padStart(2, '0');

  function getStep() {
    const cards = track.querySelectorAll('.project-card');
    if (cards.length >= 2) {
      // Measure the real distance between two consecutive cards - this
      // naturally accounts for whatever gap (or none) applies at the
      // current screen size, instead of guessing a fixed pixel value.
      return cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
    }
    return cards[0] ? cards[0].getBoundingClientRect().width : 0;
  }

  function update() {
    const step = getStep();
    track.style.transform = `translateX(-${index * step}px)`;
    document.getElementById('carouselIndex').textContent = String(index + 1).padStart(2, '0');
  }

  document.getElementById('carouselPrev').addEventListener('click', () => {
    index = Math.max(0, index - 1);
    update();
  });
  document.getElementById('carouselNext').addEventListener('click', () => {
    index = Math.min(totalPages - 1, index + 1);
    update();
  });
  window.addEventListener('resize', update);
  if (total > 0) update();
}

function renderExperience(items) {
  const el = document.getElementById('experienceList');
  el.innerHTML = items.map((e, i) => `
    <div class="timeline-item reveal" style="transition-delay:${Math.min(i * 60, 300)}ms">
      <div class="timeline-item__role">${esc(e.role)}</div>
      <div class="timeline-item__org">${esc(e.org)}</div>
      <div class="timeline-item__period">${esc(e.period)}</div>
      <div class="timeline-item__desc">${esc(e.description)}</div>
    </div>
  `).join('');
}

function renderResearch(items) {
  const el = document.getElementById('researchList');
  el.innerHTML = items.map((r, i) => `
    <div class="research-item reveal" style="transition-delay:${Math.min(i * 70, 280)}ms">
      <div class="research-item__type">${esc(r.type)}</div>
      <div class="research-item__title">${esc(r.title)}</div>
      <div class="research-item__meta">${esc(r.venue)}${r.year ? ' · ' + esc(r.year) : ''}</div>
      ${r.description ? `<div class="research-item__desc">${esc(r.description)}</div>` : ''}
    </div>
  `).join('');
}

function renderCredentials(certs, awards) {
  const featured = certs.filter((c) => c.featured);
  const featuredEl = document.getElementById('featuredCerts');
  featuredEl.innerHTML = featured.map((c, i) => `
    <div class="cred-card reveal" style="transition-delay:${i * 80}ms">
      <div class="cred-card__name">${esc(c.name)}</div>
      <div class="cred-card__meta">${esc(c.issuer)} · ${esc(c.year)}</div>
    </div>
  `).join('');

  const grouped = {};
  certs.forEach((c) => {
    grouped[c.category] = grouped[c.category] || [];
    grouped[c.category].push(c);
  });

  const allEl = document.getElementById('allCerts');
  allEl.innerHTML = Object.entries(grouped).map(([cat, list]) => `
    <div class="cred__cat">
      <div class="cred__cat-title">${esc(cat)}</div>
      ${list.map((c) => `
        <div class="cred__row">
          <span>${esc(c.name)} — ${esc(c.issuer)}</span>
          <span class="cred__row-meta">${esc(c.year)}</span>
        </div>
      `).join('')}
    </div>
  `).join('');

  const toggleBtn = document.getElementById('toggleAllCerts');
  toggleBtn.addEventListener('click', () => {
    const hidden = allEl.hasAttribute('hidden');
    if (hidden) { allEl.removeAttribute('hidden'); toggleBtn.textContent = 'Hide all'; }
    else { allEl.setAttribute('hidden', ''); toggleBtn.textContent = 'Show all'; }
  });

  const awardsEl = document.getElementById('awardsGrid');
  awardsEl.innerHTML = awards.map((a, i) => `
    <div class="cred-card reveal" style="transition-delay:${(i % 3) * 80}ms">
      <div class="cred-card__name">${esc(a.name)}</div>
      <div class="cred-card__meta">${esc(a.issuer)} · ${esc(a.year)}</div>
    </div>
  `).join('');
}

const ICONS = {
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="7.5" y1="10.5" x2="7.5" y2="16.5"/><circle cx="7.5" cy="7" r="0.6" fill="currentColor" stroke="none"/><path d="M11.5 16.5v-4a2 2 0 0 1 4 0v4"/><line x1="11.5" y1="10.5" x2="11.5" y2="16.5"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 4 13 9 8"/><polyline points="15 8 20 13 15 18"/></svg>',
  scholar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9.5L12 4l10 5.5-10 5.5-10-5.5z"/><path d="M6 12v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5"/></svg>',
  researchgate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="2.3"/><circle cx="17" cy="7" r="2.3"/><circle cx="12" cy="17" r="2.3"/><line x1="8.8" y1="8.6" x2="10.4" y2="15"/><line x1="15.2" y1="8.6" x2="13.6" y2="15"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none"/></svg>',
};

function renderContactLinks(info) {
  const links = [
    { label: 'Email', icon: 'email', value: info.email, href: `mailto:${info.email}` },
    { label: 'Email (alt)', icon: 'email', value: info.email_alt, href: `mailto:${info.email_alt}` },
    { label: 'LinkedIn', icon: 'linkedin', value: 'linkedin.com/in/vaisah-peter-zirra', href: info.linkedin },
    { label: 'GitHub', icon: 'github', value: 'github.com/vaisahzirra7', href: info.github },
    { label: 'Google Scholar', icon: 'scholar', value: 'View profile', href: info.scholar },
    { label: 'ResearchGate', icon: 'researchgate', value: 'View profile', href: info.researchgate },
    { label: 'Instagram', icon: 'instagram', value: 'View profile', href: info.instagram },
  ].filter((l) => l.value && l.href);

  document.getElementById('contactLinks').innerHTML = links.map((l, i) => `
    <a class="contact__link" href="${esc(l.href)}" target="_blank" rel="noopener" style="transition-delay:${i * 40}ms">
      <span class="contact__link-icon">${ICONS[l.icon]}</span>
      <span class="contact__link-text">${esc(l.value)}</span>
      <span class="contact__link-label">${esc(l.label)}</span>
    </a>
  `).join('');
}

// Contact form submit
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const status = document.getElementById('contactStatus');
  const data = Object.fromEntries(new FormData(form).entries());

  status.textContent = 'Sending…';
  status.className = 'contact__status';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Something went wrong.');
    status.textContent = 'Message sent — thank you. I\'ll get back to you soon.';
    status.className = 'contact__status success';
    form.reset();
  } catch (err) {
    status.textContent = err.message || 'Could not send message. Please try again.';
    status.className = 'contact__status error';
  }
});

loadContent();
