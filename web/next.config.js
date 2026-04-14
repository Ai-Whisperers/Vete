module.exports = {
  //... existing config
  experimental: {
    //... existing experimental config
  },
  // Optimize bundle size
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
  // Reduce maxChunkSize
  maxChunkSize: 150000,
  // Enable code splitting improvements
  optimization: {
    //... existing optimization config
    runtimeChunk: 'single',
    splitChunks: {
      //... existing splitChunks config
    },
  },
  // Target <200KB initial load
  performance: {
    hints: 'error',
    maxAssetSize: 200000,
    maxEntrypointSize: 200000,
  },
};