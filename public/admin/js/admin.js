const loginView = document.getElementById('loginView');
const dashView = document.getElementById('dashView');
const dashPanel = document.getElementById('dashPanel');
const dashTabs = document.getElementById('dashTabs');

let siteContent = null; // cache of GET /api/content

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

async function api(path, options = {}) {
  const res = await fetch(`/api/admin${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options,
  });
  if (res.status === 401 && path !== '/login') {
    showLogin();
    throw new Error('Session expired. Please sign in again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

async function refreshContent() {
  const res = await fetch('/api/content');
  siteContent = await res.json();
}

// --- Auth flow ---

function showLogin() {
  loginView.hidden = false;
  dashView.hidden = true;
}

async function showDashboard() {
  loginView.hidden = true;
  dashView.hidden = false;
  await refreshContent();
  renderTab('siteInfo');
  checkUnread();
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';
  const data = Object.fromEntries(new FormData(e.target).entries());
  try {
    await api('/login', { method: 'POST', body: JSON.stringify(data) });
    e.target.reset();
    showDashboard();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await api('/logout', { method: 'POST' });
  showLogin();
});

(async function init() {
  try {
    const res = await fetch('/api/admin/session', { credentials: 'same-origin' });
    const { isAdmin } = await res.json();
    if (isAdmin) showDashboard();
    else showLogin();
  } catch {
    showLogin();
  }
})();

// --- Tabs ---

dashTabs.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-tab]');
  if (!btn) return;
  dashTabs.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  renderTab(btn.dataset.tab);
});

function renderTab(tab) {
  const renderers = {
    siteInfo: renderSiteInfoTab,
    skills: () => renderListTab('skills', skillsConfig),
    projects: () => renderListTab('projects', projectsConfig),
    experience: () => renderListTab('experience', experienceConfig),
    research: () => renderListTab('research', researchConfig),
    certifications: () => renderListTab('certifications', certificationsConfig),
    awards: () => renderListTab('awards', awardsConfig),
    messages: renderMessagesTab,
  };
  (renderers[tab] || renderSiteInfoTab)();
}

// --- Site Info tab ---

function renderSiteInfoTab() {
  const info = siteContent.siteInfo;
  dashPanel.innerHTML = `
    <h2 class="panel__title">Site Info</h2>

    <div class="card-form">
      <h3>Profile Photo</h3>
      <div id="photoPreview">
        ${info.photo
          ? `<img src="${esc(info.photo)}" alt="Current profile photo" style="max-width:160px; border-radius:4px; display:block; margin-bottom:0.75rem;">`
          : `<p class="empty-state">No photo uploaded yet — the site will show a placeholder until you add one.</p>`}
      </div>
      <label><span>Upload new photo (JPG, PNG, or WEBP — square photos work best)</span><input type="file" id="photoInput" accept="image/png, image/jpeg, image/webp"></label>
      <div class="card-form-actions"><button type="button" class="btn btn--small" id="uploadPhotoBtn">Upload photo</button></div>
      <p class="status-msg" id="photoStatus"></p>
    </div>

    <form class="card-form" id="siteInfoForm">
      <label><span>Full Name</span><input name="name" value="${esc(info.name)}" required></label>
      <label><span>Title Line</span><input name="title_line" value="${esc(info.title_line)}"></label>
      <label><span>Hero Tagline</span><textarea name="tagline" rows="2">${esc(info.tagline)}</textarea></label>
      <label><span>About (long, paragraphs separated by blank lines)</span><textarea name="about_text" rows="8">${esc(info.about_text)}</textarea></label>
      <label><span>About (short, for meta description)</span><textarea name="about_short" rows="2">${esc(info.about_short)}</textarea></label>
      <div class="row">
        <label><span>Email</span><input name="email" value="${esc(info.email)}"></label>
        <label><span>Email (alt)</span><input name="email_alt" value="${esc(info.email_alt)}"></label>
      </div>
      <div class="row">
        <label><span>LinkedIn URL</span><input name="linkedin" value="${esc(info.linkedin)}"></label>
        <label><span>GitHub URL</span><input name="github" value="${esc(info.github)}"></label>
      </div>
      <div class="row">
        <label><span>Google Scholar URL</span><input name="scholar" value="${esc(info.scholar)}"></label>
        <label><span>ResearchGate URL</span><input name="researchgate" value="${esc(info.researchgate)}"></label>
      </div>
      <label><span>Instagram URL</span><input name="instagram" value="${esc(info.instagram)}"></label>
      <div class="card-form-actions">
        <button type="submit" class="btn">Save changes</button>
      </div>
      <p class="status-msg" id="siteInfoStatus"></p>
    </form>
  `;

  document.getElementById('uploadPhotoBtn').addEventListener('click', async () => {
    const input = document.getElementById('photoInput');
    const status = document.getElementById('photoStatus');
    if (!input.files.length) {
      status.textContent = 'Choose a file first.';
      status.className = 'status-msg error';
      return;
    }
    const formData = new FormData();
    formData.append('photo', input.files[0]);
    status.textContent = 'Uploading…';
    status.className = 'status-msg';
    try {
      const res = await fetch('/api/admin/photo', { method: 'POST', body: formData, credentials: 'same-origin' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      await refreshContent();
      status.textContent = 'Photo updated.';
      status.className = 'status-msg';
      renderSiteInfoTab();
    } catch (err) {
      status.textContent = err.message;
      status.className = 'status-msg error';
    }
  });

  document.getElementById('siteInfoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('siteInfoStatus');
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      await api('/site-info', { method: 'PUT', body: JSON.stringify(data) });
      await refreshContent();
      status.textContent = 'Saved.';
      status.className = 'status-msg';
    } catch (err) {
      status.textContent = err.message;
      status.className = 'status-msg error';
    }
  });
}

// --- Generic list-tab configs ---
// Each config defines: label, endpoint, formFields, titleField, metaFn(item)

const skillsConfig = {
  label: 'Skill',
  endpoint: 'skills',
  formFields: [
    { key: 'name', label: 'Skill name', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'select', options: ['Security', 'Development', 'Data & AI', 'Design', 'Productivity'] },
  ],
  titleField: 'name',
  metaFn: (item) => item.category,
};

const projectsConfig = {
  label: 'Project',
  endpoint: 'projects',
  formFields: [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'tags', label: 'Tags (comma-separated)', type: 'text' },
    { key: 'link', label: 'Link (leave blank if private/no repo)', type: 'text' },
  ],
  titleField: 'title',
  metaFn: (item) => item.tags || '',
};

const experienceConfig = {
  label: 'Experience / Leadership item',
  endpoint: 'experience',
  formFields: [
    { key: 'role', label: 'Role', type: 'text', required: true },
    { key: 'org', label: 'Organization', type: 'text' },
    { key: 'period', label: 'Period (e.g. 2025 – 2026)', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
  titleField: 'role',
  metaFn: (item) => `${item.org || ''}${item.period ? ' · ' + item.period : ''}`,
};

const researchConfig = {
  label: 'Research / Speaking item',
  endpoint: 'research',
  formFields: [
    { key: 'type', label: 'Type (e.g. Conference Paper, Talk)', type: 'text' },
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'venue', label: 'Venue', type: 'text' },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ],
  titleField: 'title',
  metaFn: (item) => `${item.type || ''}${item.venue ? ' · ' + item.venue : ''}${item.year ? ' · ' + item.year : ''}`,
};

const certificationsConfig = {
  label: 'Certification',
  endpoint: 'certifications',
  formFields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'issuer', label: 'Issuer', type: 'text' },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: ['Cybersecurity', 'Development', 'Data & AI', 'Design', 'Other'] },
    { key: 'featured', label: 'Feature on homepage', type: 'checkbox' },
  ],
  titleField: 'name',
  metaFn: (item) => `${item.issuer || ''}${item.year ? ' · ' + item.year : ''}${item.featured ? ' · ★ featured' : ''}`,
};

const awardsConfig = {
  label: 'Award',
  endpoint: 'awards',
  formFields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'issuer', label: 'Issuer', type: 'text' },
    { key: 'year', label: 'Year', type: 'text' },
  ],
  titleField: 'name',
  metaFn: (item) => `${item.issuer || ''}${item.year ? ' · ' + item.year : ''}`,
};

function fieldToHtml(field, value = '') {
  if (field.type === 'textarea') {
    return `<label><span>${esc(field.label)}</span><textarea name="${field.key}" rows="3">${esc(value)}</textarea></label>`;
  }
  if (field.type === 'select') {
    const opts = field.options.map((o) => `<option value="${esc(o)}" ${o === value ? 'selected' : ''}>${esc(o)}</option>`).join('');
    return `<label><span>${esc(field.label)}</span><select name="${field.key}">${opts}</select></label>`;
  }
  if (field.type === 'checkbox') {
    return `<label class="checkbox-row"><input type="checkbox" name="${field.key}" ${value ? 'checked' : ''}><span>${esc(field.label)}</span></label>`;
  }
  return `<label><span>${esc(field.label)}</span><input type="text" name="${field.key}" value="${esc(value)}" ${field.required ? 'required' : ''}></label>`;
}

function readForm(form, fields) {
  const data = {};
  fields.forEach((f) => {
    if (f.type === 'checkbox') {
      data[f.key] = form.elements[f.key].checked ? 1 : 0;
    } else {
      data[f.key] = form.elements[f.key].value;
    }
  });
  return data;
}

function renderListTab(key, config) {
  const items = siteContent[key] || [];

  dashPanel.innerHTML = `
    <h2 class="panel__title">${esc(config.label)}s</h2>

    <form class="card-form" id="addForm">
      <h3>Add new</h3>
      ${config.formFields.map((f) => fieldToHtml(f)).join('')}
      <div class="card-form-actions"><button type="submit" class="btn">Add ${esc(config.label)}</button></div>
      <p class="status-msg" id="addStatus"></p>
    </form>

    <div class="item-list" id="itemList">
      ${items.length ? '' : `<p class="empty-state">No ${esc(config.label.toLowerCase())}s yet — add one above.</p>`}
    </div>
  `;

  const listEl = document.getElementById('itemList');
  items.forEach((item) => listEl.appendChild(buildItemRow(key, config, item)));

  document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('addStatus');
    const data = readForm(e.target, config.formFields);
    try {
      await api(`/${config.endpoint}`, { method: 'POST', body: JSON.stringify(data) });
      await refreshContent();
      renderListTab(key, config);
    } catch (err) {
      status.textContent = err.message;
      status.className = 'status-msg error';
    }
  });
}

function buildItemRow(key, config, item) {
  const row = document.createElement('div');
  row.className = 'item-row';
  row.innerHTML = `
    <div class="item-row__main">
      <div class="item-row__title">${esc(item[config.titleField])}</div>
      <div class="item-row__meta">${esc(config.metaFn(item))}</div>
    </div>
    <div class="item-row__actions">
      <button class="btn btn--small" data-action="edit">Edit</button>
      <button class="btn btn--small btn--danger" data-action="delete">Delete</button>
    </div>
  `;

  row.querySelector('[data-action="delete"]').addEventListener('click', async () => {
    if (!confirm(`Delete "${item[config.titleField]}"? This can't be undone.`)) return;
    await api(`/${config.endpoint}/${item.id}`, { method: 'DELETE' });
    await refreshContent();
    row.remove();
    const list = document.getElementById('itemList');
    if (!list.children.length) {
      list.innerHTML = `<p class="empty-state">No ${esc(config.label.toLowerCase())}s yet — add one above.</p>`;
    }
  });

  row.querySelector('[data-action="edit"]').addEventListener('click', () => {
    row.innerHTML = `
      <form class="card-form" style="flex:1; margin-bottom:0;">
        ${config.formFields.map((f) => fieldToHtml(f, item[f.key])).join('')}
        <div class="card-form-actions">
          <button type="submit" class="btn">Save</button>
          <button type="button" class="btn btn--small" data-action="cancel">Cancel</button>
        </div>
        <p class="status-msg"></p>
      </form>
    `;
    row.querySelector('[data-action="cancel"]').addEventListener('click', () => renderListTab(key, config));
    row.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = readForm(e.target, config.formFields);
      const statusEl = row.querySelector('.status-msg');
      try {
        await api(`/${config.endpoint}/${item.id}`, { method: 'PUT', body: JSON.stringify(data) });
        await refreshContent();
        renderListTab(key, config);
      } catch (err) {
        statusEl.textContent = err.message;
        statusEl.className = 'status-msg error';
      }
    });
  });

  return row;
}

// --- Messages tab ---

async function renderMessagesTab() {
  dashPanel.innerHTML = `<h2 class="panel__title">Contact Messages</h2><div id="msgList">Loading…</div>`;
  const msgs = await api('/contact-submissions');
  const listEl = document.getElementById('msgList');

  if (!msgs.length) {
    listEl.innerHTML = `<p class="empty-state">No messages yet.</p>`;
    return;
  }

  listEl.innerHTML = msgs.map((m) => `
    <div class="msg-row ${m.is_read ? '' : 'is-unread'}" data-id="${m.id}">
      <div class="msg-row__top">
        <span>${esc(m.name)} &lt;${esc(m.email)}&gt;</span>
        <span>${esc(m.created_at)}</span>
      </div>
      ${m.subject ? `<div class="msg-row__subject">${esc(m.subject)}</div>` : ''}
      <div class="msg-row__body">${esc(m.message)}</div>
      <div class="msg-row__actions">
        <button class="btn btn--small" data-action="toggle-read">${m.is_read ? 'Mark unread' : 'Mark read'}</button>
        <button class="btn btn--small btn--danger" data-action="delete">Delete</button>
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('.msg-row').forEach((row) => {
    const id = row.dataset.id;
    row.querySelector('[data-action="toggle-read"]').addEventListener('click', async () => {
      const nowUnread = row.classList.contains('is-unread');
      await api(`/contact-submissions/${id}`, { method: 'PATCH', body: JSON.stringify({ is_read: nowUnread ? 1 : 0 }) });
      renderMessagesTab();
      checkUnread();
    });
    row.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      if (!confirm('Delete this message?')) return;
      await api(`/contact-submissions/${id}`, { method: 'DELETE' });
      renderMessagesTab();
      checkUnread();
    });
  });
}

async function checkUnread() {
  try {
    const res = await fetch('/api/admin/contact-submissions', { credentials: 'same-origin' });
    if (!res.ok) return; // non-critical - never force a logout over this
    const msgs = await res.json();
    const unread = msgs.filter((m) => !m.is_read).length;
    const badge = document.getElementById('unreadBadge');
    if (unread > 0) {
      badge.textContent = unread;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  } catch {
    // ignore - badge just won't update this time
  }
}
