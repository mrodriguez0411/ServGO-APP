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
