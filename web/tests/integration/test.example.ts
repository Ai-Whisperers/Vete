import { createTestData } from './data';
import { cleanupTestData } from './teardown';

beforeAll(async () => {
  await createTestData();
});

afterAll(async () => {
  await cleanupTestData();
});

describe('Example Test', () => {
  it('should pass', async () => {
    // Test code here
  });
});