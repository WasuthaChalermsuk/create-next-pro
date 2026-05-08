#!/usr/bin/env node

const path = require('path');

// Check Node.js version
const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0]);

if (majorVersion < 18) {
  console.error('Error: create-next-pro requires Node.js 18 or higher.');
  console.error(`Current version: ${nodeVersion}`);
  process.exit(1);
}

// Run the compiled CLI
require(path.join(__dirname, '..', 'dist', 'index.js'));
