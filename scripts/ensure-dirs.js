const fs = require('fs-extra');
const path = require('path');

const webBuildDir = path.resolve(__dirname, '../web-build');
const staticDir = path.resolve(webBuildDir, 'static/media');

// Ensure web build and static directories exist
fs.ensureDirSync(staticDir);
console.log('Ensured web build directories exist');
