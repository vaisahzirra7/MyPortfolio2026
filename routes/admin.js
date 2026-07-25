const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'data', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-photo-${Date.now()}${ext}`);
  },
});
const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Only JPG, PNG, or WEBP images are allowed.'));
    cb(null, true);
  },
});

// --- Auth ---

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  const validUser = username === process.env.ADMIN_USERNAME;
  const validPass = validUser && bcrypt.compareSync(password || '', process.env.ADMIN_PASSWORD_HASH || '');

  if (!validUser || !validPass) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  req.session.isAdmin = true;
  res.json({ success: true });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

router.get('/session', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// Everything below requires a logged-in admin
router.use(requireAuth);

// --- Site info (singleton) ---

router.put('/site-info', (req, res) => {
  const fields = ['name', 'title_line', 'tagline', 'about_text', 'about_short', 'email', 'email_alt', 'linkedin', 'github', 'scholar', 'researchgate', 'instagram'];
  const body = req.body || {};
  const patch = {};
  fields.forEach((f) => { patch[f] = body[f] !== undefined ? String(body[f]) : ''; });

  db.updateSiteInfo(patch);
  res.json({ success: true });
});

router.post('/photo', uploadPhoto.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const url = `/uploads/${req.file.filename}`;
  db.updateSiteInfo({ photo: url });
  res.json({ success: true, url });
});

// --- Generic CRUD factory for simple list-based collections ---

function makeCrud(collection, fields) {
  const sub = express.Router();

  sub.post('/', (req, res) => {
    const body = req.body || {};
    const numericFields = ['featured'];
    const item = {};
    fields.filter((f) => f !== 'sort_order').forEach((f) => {
      if (body[f] !== undefined) item[f] = body[f];
      else item[f] = numericFields.includes(f) ? 0 : '';
    });
    const saved = db.insertItem(collection, item);
    res.json({ success: true, id: saved.id });
  });

  sub.put('/:id', (req, res) => {
    const body = req.body || {};
    const patch = {};
    fields.forEach((f) => { if (f in body) patch[f] = body[f]; });
    db.updateItem(collection, req.params.id, patch);
    res.json({ success: true });
  });

  sub.delete('/:id', (req, res) => {
    db.deleteItem(collection, req.params.id);
    res.json({ success: true });
  });

  // Reorder: body = { order: [id1, id2, id3, ...] } in desired order
  sub.post('/reorder', (req, res) => {
    const order = (req.body && req.body.order) || [];
    db.reorderItems(collection, order);
    res.json({ success: true });
  });

  return sub;
}

router.use('/skills', makeCrud('skills', ['name', 'category', 'sort_order']));
router.use('/projects', makeCrud('projects', ['title', 'description', 'tags', 'link', 'sort_order']));
router.use('/experience', makeCrud('experience', ['role', 'org', 'period', 'description', 'sort_order']));
router.use('/research', makeCrud('research', ['type', 'title', 'venue', 'year', 'description', 'sort_order']));
router.use('/certifications', makeCrud('certifications', ['name', 'issuer', 'year', 'category', 'featured', 'sort_order']));
router.use('/awards', makeCrud('awards', ['name', 'issuer', 'year', 'sort_order']));

// --- Contact submissions (read/manage only, no create via admin) ---

router.get('/contact-submissions', (req, res) => {
  res.json(db.listSubmissions());
});

router.patch('/contact-submissions/:id', (req, res) => {
  const isRead = req.body && req.body.is_read ? 1 : 0;
  db.updateItem('contactSubmissions', req.params.id, { is_read: isRead });
  res.json({ success: true });
});

router.delete('/contact-submissions/:id', (req, res) => {
  db.deleteItem('contactSubmissions', req.params.id);
  res.json({ success: true });
});

module.exports = router;
