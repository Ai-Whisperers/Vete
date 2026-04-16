#!/usr/bin/env ts-node
import 'reflect-metadata';
import { config } from '../lib/jest/config';

import { runCLI } from '@jest/core';

runCLI(config, ['--config', 'lib/jest/config.ts']).then((result) => {
  if (result.numFailedTests > 0 || result.numFailedTests > 0) {
    process.exit(1);
  }
});