const fs = require('fs');
const path = require('path');

// Create necessary directories for the project
const directories = [
  'web/assets',
  'web/static',
  '.expo/metro/externals/node:sea'
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
  } catch (error) {
    // Handle special case for node:sea directory
    if (dir.includes('node:sea')) {
      const parentDir = path.dirname(fullPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      // Try creating the node:sea directory
      try {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
      } catch (seaError) {
        console.log(`Could not create node:sea directory, this is expected on some systems`);
      }
    } else {
      throw error;
    }
  }
});
