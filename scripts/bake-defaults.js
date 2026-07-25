// Run with: npm run bake-defaults
// Copies your current local content (data/portfolio.json) into data/seed.json,
// which becomes the starting content on every fresh deploy.
//
// Use this workflow if you're hosting on a platform without persistent storage
// (e.g. Render's free tier): edit content locally with `npm start`, then run
// this script, commit, and push - your edits become the new defaults instead
// of disappearing when the host resets its filesystem.

const fs = require('fs');
const path = require('path');

const LIVE_PATH = path.join(__dirname, '..', 'data', 'portfolio.json');
const SEED_PATH = path.join(__dirname, '..', 'data', 'seed.json');

if (!fs.existsSync(LIVE_PATH)) {
  console.log('No data/portfolio.json found - run "npm start" and make some edits first.');
  process.exit(0);
}

const live = JSON.parse(fs.readFileSync(LIVE_PATH, 'utf-8'));
delete live.contactSubmissions; // never bake private messages into the public defaults

fs.writeFileSync(SEED_PATH, JSON.stringify(live, null, 2));
console.log('Saved your current content to data/seed.json.');

if (live.siteInfo && live.siteInfo.photo && live.siteInfo.photo.startsWith('/uploads/')) {
  console.log('\nHeads up: your profile photo was uploaded through the admin panel,');
  console.log('which is stored in data/uploads/ - a folder that is NOT committed to git');
  console.log('(see .gitignore) and will NOT survive a host that resets its filesystem.');
  console.log('To make your photo permanent on a free/ephemeral host:');
  console.log('  1. Copy your photo file into the public/ folder, e.g. public/profile.jpg');
  console.log('  2. Open data/seed.json and change "photo" to "/profile.jpg"');
  console.log('  3. Commit both the image and data/seed.json, then push');
}

console.log('\nNext: commit and push this change so your host redeploys with it as the default.');
console.log('  git add data/seed.json');
console.log('  git commit -m "Update site content"');
console.log('  git push');
