const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Simple web-focused Metro config
const config = getDefaultConfig(__dirname, {
  // Web-specific configuration
  isCSSEnabled: true,
});

// Fix MIME type issues for web platform
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Fix MIME type for JavaScript bundles
      if (req.url && (req.url.includes('.bundle') || req.url.includes('node_modules'))) {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

// Simplified resolver for web
config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'png', 'jpg', 'jpeg', 'gif', 'svg'],
  sourceExts: [...config.resolver.sourceExts, 'js', 'jsx', 'json', 'ts', 'tsx'],
  resolverMainFields: ['browser', 'module', 'main'],
};

module.exports = config;
