import { test, expect } from '@jest/globals';

test('coverage gates are configured', () => {
  const jestConfig = require('../jest.config');
  expect(jestConfig.coverageThreshold).toBeDefined();
  expect(jestConfig.coverageThreshold.global).toBeDefined();
  expect(jestConfig.coverageThreshold.global.branches).toBe(90);
  expect(jestConfig.coverageThreshold.global.functions).toBe(90);
  expect(jestConfig.coverageThreshold.global.lines).toBe(90);
  expect(jestConfig.coverageThreshold.global.statements).toBe(90);
});
Note: The above changes assume that you want to set a global coverage threshold of 90% for branches, functions, lines, and statements. You can adjust these values according to your requirements. Also, the `config-validation.test.ts` file is just an example, you may need to create a new file or modify an existing one to test the coverage gates configuration.