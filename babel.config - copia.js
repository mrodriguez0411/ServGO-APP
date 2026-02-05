// @ts-check

/** @type {import('@babel/core').ConfigAPI} */
module.exports = function(api) {
  api.cache(true);
  
  const isWeb = process.env.PLATFORM === 'web' || 
               process.env.BROWSER === '1' || 
               process.env.EXPO_PUBLIC_PLATFORM === 'web';
  
  const plugins = [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: [
          '.web.js',
          '.web.ts',
          '.web.tsx',
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.json'
        ],
        alias: {
          '^react-native$': isWeb ? 'react-native-web' : 'react-native',
          '^@/(.*)$': './src/$1',
          '^react-native-vector-icons$': 'react-native-vector-icons'
        }
      }
    ]
  ];

  if (isWeb) {
    plugins.push('@babel/plugin-proposal-export-namespace-from');
  }

  return {
    presets: ['babel-preset-expo'],
    plugins: plugins.filter(Boolean),
    env: {
      production: {
        plugins: ['react-native-paper/babel']
      },
    },
  };
};
