// Run with: npm run reset-data
// Deletes your current content and restores the original CV-based defaults on next server start.
// Use this if content gets accidentally cleared/deleted through the admin panel.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const dbPath = path.join(__dirname, '..', 'data', 'portfolio.json');

if (!fs.existsSync(dbPath)) {
  console.log('No data file found at data/portfolio.json — nothing to reset.');
  process.exit(0);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('This will permanently erase ALL current content (including anything you added or edited');
console.log('through the admin panel) and restore the original CV-based defaults.\n');

rl.question("Type 'yes' to continue: ", (answer) => {
  if (answer.trim().toLowerCase() === 'yes') {
    fs.unlinkSync(dbPath);
    console.log('\nDone. Run "npm start" and the site will regenerate with the default content.');
  } else {
    console.log('\nCancelled — nothing was changed.');
  }
  rl.close();
});
