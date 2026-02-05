const createExpoWebpackConfig = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const isWeb = env.platform === 'web';
  
  // Create base config
  const config = await createExpoWebpackConfig(env);
  
  // Web-specific configuration
  if (isWeb) {
    config.devServer = {
      headers: {
        'Content-Type': 'text/javascript',
      },
      devMiddleware: {
        writeToDisk: true,
      },
      allowedHosts: 'all',
    };
    
    config.output = {
      ...config.output,
      publicPath: '/',
      filename: 'static/js/[name].bundle.js',
      chunkFilename: 'static/js/[name].chunk.js',
    };
  }
  
  // Customize the config before returning it
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
      'react-native-web': 'react-native-web',
    },
    extensions: [
      '.web.js',
      '.web.ts',
      '.web.tsx',
      ...(config.resolve?.extensions || []),
    ],
  };

  // Add support for .web.js files and fonts
  config.module = config.module || { rules: [] };
  config.module.rules = config.module.rules || [];
  
  config.module.rules.push(
    {
      test: /\.(js|ts|tsx)$/,
      exclude: /node_modules\/.*/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['babel-preset-expo'],
          cacheDirectory: true,
        },
      },
    }
  );

  // Fix for web builds
  if (env.mode === 'production') {
    config.output = {
      ...config.output,
      publicPath: '/'
    };
  }

  return config;
};
