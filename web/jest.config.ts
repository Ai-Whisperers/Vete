import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // ... existing config ...
  setupFilesAfterEnv: ['<rootDir>/tests/database/setup-vitest.ts'],
};

export default config;