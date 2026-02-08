const fs = require('fs');
const path = require('path');

// Patch the @expo/cli file to handle node:sea directory issue on Windows
const externalsFile = path.join(__dirname, 'node_modules/@expo/cli/src/start/server/metro/externals.ts');

if (fs.existsSync(externalsFile)) {
  let content = fs.readFileSync(externalsFile, 'utf8');
  
  // Replace the problematic mkdir call
  content = content.replace(
    /await fs\.promises\.mkdir\(path\.join\(externalsPath, 'node:sea'\), \{ recursive: true \}\)/g,
    `try {
    await fs.promises.mkdir(path.join(externalsPath, 'node:sea'), { recursive: true });
  } catch (error) {
    // Skip node:sea directory creation on Windows
    if (error.code === 'ENOENT') {
      console.log('Skipping node:sea directory creation on Windows');
    } else {
      throw error;
    }
  }`
  );
  
  fs.writeFileSync(externalsFile, content);
  console.log('Patched externals.ts to handle node:sea directory issue');
} else {
  console.log('externals.ts not found, trying to patch the built version');
  
  // Try to patch the built JS version
  const builtExternalsFile = path.join(__dirname, 'node_modules/@expo/cli/build/start/server/metro/externals.js');
  if (fs.existsSync(builtExternalsFile)) {
    let content = fs.readFileSync(builtExternalsFile, 'utf8');
    
    // Replace the problematic mkdir call in the built version
    content = content.replace(
      /await fs_1\.promises\.mkdir\(path_1\.default\.join\(externalsPath, 'node:sea'\), \{ recursive: true \}\)/g,
      `try {
    await fs_1.promises.mkdir(path_1.default.join(externalsPath, 'node:sea'), { recursive: true });
  } catch (error) {
    // Skip node:sea directory creation on Windows
    if (error.code === 'ENOENT') {
      console.log('Skipping node:sea directory creation on Windows');
    } else {
      throw error;
    }
  }`
    );
    
    fs.writeFileSync(builtExternalsFile, content);
    console.log('Patched built externals.js to handle node:sea directory issue');
  } else {
    console.log('Built externals.js not found either');
  }
}
