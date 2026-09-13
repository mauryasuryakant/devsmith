#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectDir = process.cwd();
const devsmithDir = path.join(projectDir, '.devsmith');
const configPath = path.join(devsmithDir, 'config.json');
const ignored = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.devsmith']);

function init() {
  fs.mkdirSync(devsmithDir, { recursive: true });
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, '{\n  "version": 1\n}\n');
  }
  console.log('DevSmith initialized ✓');
}

function status() {
  console.log('DevSmith');
  if (fs.existsSync(devsmithDir)) {
    console.log('✓ Project initialized');
  } else {
    console.log('✗ Project not initialized\n');
    console.log('Run: devsmith init');
  }
}

function scan(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...scan(fullPath));
    } else if (entry.isFile()) {
      files.push(path.relative(projectDir, fullPath).split(path.sep).join('/'));
    }
  }
  return files;
}

function index() {
  fs.mkdirSync(devsmithDir, { recursive: true });
  const files = scan(projectDir).sort();
  fs.writeFileSync(
    path.join(devsmithDir, 'index.json'),
    JSON.stringify({ files }, null, 2) + '\n'
  );
  console.log('DevSmith\n✓ Project indexed\nFiles: ' + files.length);
}

function comingSoon(command) {
  console.log('DevSmith ' + command[0].toUpperCase() + command.slice(1) + '\n\nComing soon 🚧');
}

const command = process.argv[2];

switch (command) {
  case 'init':
    init();
    break;
  case 'status':
    status();
    break;
  case 'index':
    index();
    break;
  case 'context':
  case 'analyze':
  case 'memory':
    comingSoon(command);
    break;
  default:
    console.log('Usage: devsmith <init|status|index|context|analyze|memory>');
    process.exitCode = 1;
}
