import type { Configuration } from 'webpack';

export function getCodeSplittingConfig(): Configuration {
  return {
    //... other configurations ...
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 10000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
  };
}