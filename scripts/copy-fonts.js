const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.resolve(__dirname, '../node_modules/react-native-vector-icons/Fonts');
const destDir = path.resolve(__dirname, '../web-build/static/media');

// Ensure destination directory exists
fs.ensureDirSync(destDir);

// Copy all font files
fs.readdir(sourceDir, (err, files) => {
  if (err) {
    console.error('Error reading source directory:', err);
    return;
  }

  files.forEach(file => {
    if (file.endsWith('.ttf')) {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);
      
      fs.copyFile(sourcePath, destPath, err => {
        if (err) {
          console.error(`Error copying ${file}:`, err);
        } else {
          console.log(`Copied ${file} to web build`);
        }
      });
    }
  });
});
