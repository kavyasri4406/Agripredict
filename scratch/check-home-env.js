const fs = require('fs');
const path = require('path');
const homeEnv = path.join(process.env.USERPROFILE || 'C:\\Users\\Sri', '.env');
console.log(".env path:", homeEnv);
if (fs.existsSync(homeEnv)) {
  console.log(".env exists!");
  const content = fs.readFileSync(homeEnv, 'utf-8');
  console.log("Keys in ~/.env:", content.split('\n').map(l => l.split('=')[0].trim()).filter(Boolean));
} else {
  console.log(".env does not exist in home directory.");
}
