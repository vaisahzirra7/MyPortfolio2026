require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Render (and most hosts) terminate HTTPS in front of the app and forward
// plain HTTP internally - trust proxy so secure cookies work correctly.
const isDeployed = process.env.RENDER || process.env.NODE_ENV === 'production';
if (isDeployed) app.set('trust proxy', 1);

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: !!isDeployed, // only require HTTPS once actually deployed
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
  },
}));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'data', 'uploads')));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler - catches multer/upload errors and returns JSON instead of an HTML crash page
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message || 'Something went wrong.' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Portfolio site running at http://localhost:${PORT}`);
  console.log(`Admin panel at        http://localhost:${PORT}/admin`);
});
