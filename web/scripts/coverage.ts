#!/usr/bin/env ts-node
import { getCoverageSummary } from '../lib/coverage/coverage-summary';
import * as fs from 'fs';

const coverageReport = fs.readFileSync('coverage/lcov.info', 'utf8');
const summary = getCoverageSummary(coverageReport);

if (summary.percent < 80) {
  console.error(`Coverage is below threshold: ${summary.percent}%`);
  process.exit(1);
}