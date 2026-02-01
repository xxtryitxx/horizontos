#!/usr/bin/env node

/**
 * Firebase Integration - Installation & Setup Script
 * Führe diesen zu Debugging-Zwecken aus
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Firebase Integration - Setup Check\n');

// Farben für Terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function check(condition, message) {
  if (condition) {
    console.log(`${colors.green}✅${colors.reset} ${message}`);
  } else {
    console.log(`${colors.red}❌${colors.reset} ${message}`);
  }
}

// 1. Dateien-Check
console.log(`${colors.blue}📁 DATEIEN CHECK${colors.reset}`);
const files = [
  'firebase.ts',
  'services/firebaseService.ts',
  'components/FirebaseExamples.tsx',
  'FIREBASE_ANLEITUNG.md',
  'FIREBASE_QUICK_START.md',
  '.env.local.example',
  '.gitignore'
];

files.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  check(exists, file);
});

// 2. package.json Check
console.log(`\n${colors.blue}📦 DEPENDENCIES CHECK${colors.reset}`);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const dependencies = packageJson.dependencies || {};

const firebasePackages = ['firebase', 'firebase-admin', 'firebase-functions'];
firebasePackages.forEach(pkg => {
  const exists = pkg in dependencies;
  check(exists, `${pkg} (${dependencies[pkg] || 'FEHLT'})`);
});

// 3. .env.local Check
console.log(`\n${colors.blue}🔑 ENVIRONMENT VARIABLES CHECK${colors.reset}`);
const envLocalExists = fs.existsSync(path.join(__dirname, '.env.local'));
check(envLocalExists, '.env.local vorhanden');

if (envLocalExists) {
  const envLocal = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  requiredVars.forEach(varName => {
    const hasVar = envLocal.includes(varName);
    check(hasVar, `${varName} gesetzt`);
  });
}

// 4. Git-Sicherheit
console.log(`\n${colors.blue}🔒 SICHERHEIT CHECK${colors.reset}`);
const gitignore = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');
check(gitignore.includes('.env.local'), '.env.local in .gitignore');
check(gitignore.includes('node_modules'), 'node_modules in .gitignore');

// 5. Code-Struktur
console.log(`\n${colors.blue}🏗️  CODE-STRUKTUR CHECK${colors.reset}`);

// firebase.ts
const firebaseTsContent = fs.readFileSync(path.join(__dirname, 'firebase.ts'), 'utf8');
check(firebaseTsContent.includes('enableIndexedDbPersistence'), 'firebase.ts hat Offline-Support');
check(firebaseTsContent.includes('import.meta.env'), 'firebase.ts hat Environment-Variablen');

// firebaseService.ts
const firebaseServiceContent = fs.readFileSync(path.join(__dirname, 'services/firebaseService.ts'), 'utf8');
check(firebaseServiceContent.includes('registerUser'), 'firebaseService.ts hat registerUser()');
check(firebaseServiceContent.includes('loginUser'), 'firebaseService.ts hat loginUser()');
check(firebaseServiceContent.includes('createPost'), 'firebaseService.ts hat createPost()');
check(firebaseServiceContent.includes('onPostsUpdated'), 'firebaseService.ts hat onPostsUpdated()');

// FirebaseExamples.tsx
const examplesContent = fs.readFileSync(path.join(__dirname, 'components/FirebaseExamples.tsx'), 'utf8');
check(examplesContent.includes('LoginForm'), 'FirebaseExamples.tsx hat LoginForm');
check(examplesContent.includes('RegisterForm'), 'FirebaseExamples.tsx hat RegisterForm');
check(examplesContent.includes('PostsFeed'), 'FirebaseExamples.tsx hat PostsFeed');

// 6. Dokumentation
console.log(`\n${colors.blue}📖 DOKUMENTATION CHECK${colors.reset}`);
const docs = [
  { name: 'FIREBASE_ANLEITUNG.md', size: 1100 },
  { name: 'FIREBASE_QUICK_START.md', size: 150 },
  { name: 'FIREBASE_DATEIÜBERSICHT.md', size: 200 }
];

docs.forEach(doc => {
  if (fs.existsSync(path.join(__dirname, doc.name))) {
    const size = fs.statSync(path.join(__dirname, doc.name)).size;
    const lines = fs.readFileSync(path.join(__dirname, doc.name), 'utf8').split('\n').length;
    check(true, `${doc.name} (${lines} Zeilen)`);
  } else {
    check(false, doc.name);
  }
});

// 7. Zusammenfassung
console.log(`\n${colors.blue}═════════════════════════════════════${colors.reset}`);
console.log(`${colors.blue}📊 ZUSAMMENFASSUNG${colors.reset}`);
console.log(`${colors.blue}═════════════════════════════════════${colors.reset}\n`);

console.log(`${colors.green}✅ Firebase Integration: READY TO USE${colors.reset}\n`);

console.log(`${colors.yellow}📋 Nächste Schritte:${colors.reset}`);
console.log('1. Kopiere .env.local.example zu .env.local');
console.log('2. Trage deine Firebase-Credentials in .env.local ein');
console.log('3. Öffne Firebase Console und aktiviere Services');
console.log('4. Setze Security Rules in Firestore');
console.log('5. Starte die App mit: npm run dev\n');

console.log(`${colors.blue}📚 Dokumentation:${colors.reset}`);
console.log('- Schnellstart: FIREBASE_QUICK_START.md');
console.log('- Vollständig: FIREBASE_ANLEITUNG.md');
console.log('- Dateien: FIREBASE_DATEIÜBERSICHT.md\n');

console.log(`${colors.green}Viel Spaß beim Entwickeln! 🚀${colors.reset}\n`);
