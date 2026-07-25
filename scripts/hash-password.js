// Run with: npm run hash-password
// Prompts for a password, prints a bcrypt hash to paste into .env as ADMIN_PASSWORD_HASH

const readline = require('readline');
const bcrypt = require('bcryptjs');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Choose an admin password: ', (password) => {
  const hash = bcrypt.hashSync(password, 10);
  console.log('\nAdd this line to your .env file:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
  rl.close();
});
