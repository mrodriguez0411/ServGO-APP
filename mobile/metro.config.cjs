const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Create the default Metro config
const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true,
});

// Basic configuration
config.resolver = {
  ...config.resolver,
  // Add support for all file extensions
  assetExts: [...config.resolver.assetExts, 'cjs', 'mjs', 'png', 'jpg', 'jpeg', 'gif', 'svg'],
  sourceExts: [...config.resolver.sourceExts, 'js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
  resolverMainFields: ['browser', 'module', 'main'],
  // Ensure proper module resolution
  extraNodeModules: new Proxy({}, {
    get: (target, name) => path.join(process.cwd(), `node_modules/${name}`)
  })
};

// Ensure proper transformer configuration
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Configure watch folders and resolver
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, 'src'),
];

// Fix for node_modules resolution
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  'node_modules'
];

// Override server configuration to handle node:sea directory issue
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Handle the node:sea directory creation issue
      if (req.url && req.url.includes('node:sea')) {
        return next();
      }
      return middleware(req, res, next);
    };
  }
};

// Ignore problematic paths and system directories
config.watcher = {
  ...config.watcher,
  additionalExts: ['js', 'jsx', 'ts', 'tsx', 'cjs', 'mjs', 'json'],
  watchman: {
    ...config.watcher?.watchman,
    deferStates: ["hg.update", "svn.changes"],
  },
  // Exclude system directories and other problematic paths
  watchman: {
    ...config.watcher?.watchman,
    watchmanIgnore: {
      ...config.watcher?.watchman?.watchmanIgnore,
      dirs: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.expo/**',
        '**/ios/build/**',
        '**/android/build/**',
        '**/System Volume Information/**',
        '**/$Recycle.Bin/**',
        '**/AppData/**',
        '**/Temp/**',
        '**/tmp/**',
        '**/dist/**',
        '**/.next/**',
        '**/.expo-shared/**',
        '**/bower_components/**',
        '**/coverage/**',
        '**/build/**',
      ],
    },
  },
  // Enable faster file watching on Windows
  useWatchman: true,
  usePolling: false,
  forceWatchman: true,
};

// Set the project root
config.projectRoot = __dirname;

module.exports = config;
