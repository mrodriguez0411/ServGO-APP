const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Create a custom resolver for react-async-hook
const extraNodeModules = {
  'react-async-hook': path.resolve(__dirname, 'node_modules/react-async-hook'),
};

const nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, 'node_modules/react-native-country-picker-modal/node_modules'),
];

const config = getDefaultConfig(__dirname);

// Fix MIME type issues for web platform and handle node:sea directory
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Fix MIME type for JavaScript bundles and node modules
      if (req.url && (req.url.includes('.bundle') || req.url.includes('node_modules') || req.url.includes('AppEntry'))) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      // Handle node:sea directory requests gracefully
      if (req.url && req.url.includes('node:sea')) {
        return res.status(404).end();
      }
      // Handle OPTIONS requests for CORS
      if (req.method === 'OPTIONS') {
        res.writeHead(200, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        return res.end();
      }
      return middleware(req, res, next);
    };
  }
};

// Configuración para manejar archivos SVG
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...config.resolver,
  // Add the custom resolver
  extraNodeModules,
  nodeModulesPaths,
  // Handle SVG files
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
  // Add a resolver for react-async-hook
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName === 'react-async-hook') {
      return {
        filePath: path.resolve(__dirname, 'node_modules/react-async-hook/dist/index.js'),
        type: 'sourceFile',
      };
    }
    // Use the default resolver for other modules
    return context.resolveRequest(context, moduleName, platform);
  },
};

// Try to apply NativeWind configuration if it's installed
try {
  const { withNativeWind } = require('nativewind/metro');
  module.exports = withNativeWind(config);
} catch (error) {
  console.warn('NativeWind is not installed. Skipping NativeWind configuration.');
  module.exports = config;
}
