// Simple file-based JSON storage. No native modules, no compilation step -
// just Node's built-in fs. Works identically on any OS with no setup.

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'portfolio.json');

const SEED_PATH = path.join(__dirname, 'data', 'seed.json');

function loadSeedData() {
  const raw = JSON.parse(fs.readFileSync(SEED_PATH, 'utf-8'));
  raw.contactSubmissions = [];
  return raw;
}

function assignIds(data) {
  ['skills', 'projects', 'experience', 'research', 'certifications', 'awards', 'contactSubmissions'].forEach((key) => {
    data[key].forEach((item, i) => {
      if (item.id === undefined) item.id = i + 1;
    });
  });
  return data;
}

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const fresh = assignIds(loadSeedData());
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
  }
}

function load() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- Generic collection helpers ---

function nextId(collection) {
  return collection.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

function listCollection(name) {
  const data = load();
  return [...data[name]].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function insertItem(name, fields) {
  const data = load();
  const maxOrder = data[name].reduce((m, i) => Math.max(m, i.sort_order ?? -1), -1);
  const item = { id: nextId(data[name]), ...fields, sort_order: maxOrder + 1 };
  data[name].push(item);
  save(data);
  return item;
}

function updateItem(name, id, patch) {
  const data = load();
  const item = data[name].find((i) => i.id === Number(id));
  if (item) Object.assign(item, patch);
  save(data);
  return item;
}

function deleteItem(name, id) {
  const data = load();
  data[name] = data[name].filter((i) => i.id !== Number(id));
  save(data);
}

function reorderItems(name, orderedIds) {
  const data = load();
  orderedIds.forEach((id, i) => {
    const item = data[name].find((it) => it.id === Number(id));
    if (item) item.sort_order = i;
  });
  save(data);
}

// --- Site info (singleton) ---

function getSiteInfo() {
  return load().siteInfo;
}

function updateSiteInfo(patch) {
  const data = load();
  data.siteInfo = { ...data.siteInfo, ...patch };
  save(data);
  return data.siteInfo;
}

// --- Contact submissions ---

function addSubmission({ name, email, subject, message }) {
  const data = load();
  const submission = {
    id: nextId(data.contactSubmissions),
    name, email, subject, message,
    created_at: new Date().toISOString(),
    is_read: 0,
  };
  data.contactSubmissions.push(submission);
  save(data);
  return submission;
}

function listSubmissions() {
  const data = load();
  return [...data.contactSubmissions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

module.exports = {
  getSiteInfo,
  updateSiteInfo,
  listCollection,
  insertItem,
  updateItem,
  deleteItem,
  reorderItems,
  addSubmission,
  listSubmissions,
  updateItemIn: updateItem, // alias used for contact submissions patch/delete reuse
};
