const express = require('express');
const db = require('../db');

const router = express.Router();

// Full site content in one call - keeps the frontend simple
router.get('/content', (req, res) => {
  res.json({
    siteInfo: db.getSiteInfo(),
    skills: db.listCollection('skills'),
    projects: db.listCollection('projects'),
    experience: db.listCollection('experience'),
    research: db.listCollection('research'),
    certifications: db.listCollection('certifications').sort((a, b) => (b.featured - a.featured) || (a.category > b.category ? 1 : -1)),
    awards: db.listCollection('awards'),
  });
});

// Contact form submission - public, no auth needed
router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (name.length > 200 || email.length > 200 || (subject || '').length > 300 || message.length > 5000) {
    return res.status(400).json({ error: 'One of the fields is too long.' });
  }

  db.addSubmission({
    name: name.trim(),
    email: email.trim(),
    subject: (subject || '').trim(),
    message: message.trim(),
  });

  res.json({ success: true });
});

module.exports = router;
