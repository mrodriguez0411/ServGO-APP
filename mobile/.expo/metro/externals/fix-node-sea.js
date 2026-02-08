// This file is a workaround for the node:sea directory issue
// The colon in "node:sea" causes issues on Windows systems
const fs = require('fs');
const path = require('path');

// Create the problematic directory structure
const targetDir = path.join(__dirname, 'node:sea');

try {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('Created node:sea directory');
  }
} catch (error) {
  console.log('Could not create node:sea directory, this is expected on Windows');
}
