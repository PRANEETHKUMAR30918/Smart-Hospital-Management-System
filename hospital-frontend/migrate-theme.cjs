const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  { regex: /bg-slate-900/g, replacement: 'bg-background' },
  { regex: /bg-slate-800\/30/g, replacement: 'bg-surface/50' },
  { regex: /bg-slate-800/g, replacement: 'bg-surface' },
  { regex: /text-slate-200/g, replacement: 'text-content' },
  { regex: /text-white/g, replacement: 'text-content' },
  { regex: /text-slate-300/g, replacement: 'text-content' },
  { regex: /text-slate-400/g, replacement: 'text-content-muted' },
  { regex: /text-slate-500/g, replacement: 'text-content-muted' },
  { regex: /border-slate-700\/50/g, replacement: 'border-border' },
  { regex: /border-slate-700/g, replacement: 'border-border' },
  { regex: /border-slate-600/g, replacement: 'border-border' },
  { regex: /bg-slate-700/g, replacement: 'bg-border' },
  { regex: /hover:bg-slate-800/g, replacement: 'hover:bg-surface' },
  { regex: /hover:bg-slate-700/g, replacement: 'hover:bg-border' },
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

traverseDirectory(directoryPath);
console.log('Done!');
