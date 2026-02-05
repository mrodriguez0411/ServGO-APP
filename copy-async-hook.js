const fs = require('fs-extra');
const path = require('path');

const source = path.join(__dirname, 'node_modules', 'react-native-country-picker-modal', 'node_modules', 'react-async-hook');
const target = path.join(__dirname, 'node_modules', 'react-async-hook');

// Ensure the target directory exists
fs.ensureDirSync(path.dirname(target));

// Copy the package
try {
  // Remove the target directory if it exists
  if (fs.existsSync(target)) {
    fs.removeSync(target);
  }
  
  // Copy the package
  fs.copySync(source, target);
  console.log('Successfully copied react-async-hook to node_modules');
} catch (error) {
  console.error('Error copying react-async-hook:', error);
}
