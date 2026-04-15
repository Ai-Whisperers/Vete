import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import type { Configuration } from 'webpack';

export function getBundleAnalyzerPlugin(): BundleAnalyzerPlugin {
  return new BundleAnalyzerPlugin();
}

export function getMaxChunkSize(): number {
  return 200 * 1024; // 200KB
}