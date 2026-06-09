import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- SCMS Build Validation Utility ---');

const checkDirectories = [
  'backend',
  'backend/config',
  'backend/middleware',
  'backend/models',
  'backend/routes',
  'frontend',
  'frontend/src',
  'frontend/src/components',
  'frontend/src/context',
  'frontend/src/pages'
];

const checkFiles = [
  'backend/server.js',
  'backend/config/db.js',
  'backend/middleware/auth.js',
  'backend/middleware/upload.js',
  'backend/models/index.js',
  'backend/models/mongoSubmission.js',
  'backend/routes/auth.js',
  'backend/routes/employees.js',
  'backend/routes/jobs.js',
  'backend/routes/ads.js',
  'backend/routes/submissions.js',
  'backend/routes/analytics.js',
  'backend/routes/export.js',
  'frontend/package.json',
  'frontend/index.html',
  'frontend/src/main.jsx',
  'frontend/src/App.jsx',
  'frontend/src/index.css',
  'frontend/src/components/Navbar.jsx',
  'frontend/src/components/Footer.jsx',
  'frontend/src/context/AuthContext.jsx',
  'frontend/src/context/ThemeContext.jsx',
  'frontend/src/pages/Home.jsx',
  'frontend/src/pages/About.jsx',
  'frontend/src/pages/Services.jsx',
  'frontend/src/pages/Careers.jsx',
  'frontend/src/pages/Login.jsx',
  'frontend/src/pages/AdminDashboard.jsx',
  'frontend/src/pages/EmployeeDashboard.jsx'
];

let ok = true;

console.log('\nChecking directory structures:');
checkDirectories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
    console.log(`  [OK]  ${dir}`);
  } else {
    console.log(`  [ERR] Missing directory: ${dir}`);
    ok = false;
  }
});

console.log('\nChecking critical system files:');
checkFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isFile()) {
    console.log(`  [OK]  ${file}`);
  } else {
    console.log(`  [ERR] Missing file: ${file}`);
    ok = false;
  }
});

console.log('\nChecking environment setups:');
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
  console.log('  [OK]  backend/.env configured.');
} else {
  console.log('  [WARN] backend/.env missing! Please copy from backend/.env.example');
}

if (ok) {
  console.log('\n>>> Validation SUCCESS: All core structures are in place! <<<');
} else {
  console.log('\n>>> Validation FAILED: Core files are missing. <<<');
}
process.exit(ok ? 0 : 1);
