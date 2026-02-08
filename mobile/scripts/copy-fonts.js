const fs = require('fs');
const path = require('path');

// Copy fonts from node_modules to web build directory
const sourceDir = path.join(__dirname, '..', 'node_modules', '@expo', 'google-fonts');
const targetDir = path.join(__dirname, '..', 'web', 'static', 'fonts');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy font files if they exist
if (fs.existsSync(sourceDir)) {
  const fontFiles = fs.readdirSync(sourceDir);
  fontFiles.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    if (fs.statSync(sourcePath).isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied font: ${file}`);
    }
  });
} else {
  console.log('Google fonts directory not found, skipping font copy');
}
