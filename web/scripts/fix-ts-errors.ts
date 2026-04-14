import { execSync } from 'child_process';

const fixTsErrors = () => {
  try {
    const output = execSync('tsc --noEmit', { stdio: 'inherit' });
    console.log(output.toString());
  } catch (error) {
    console.error(error);
  }
};

fixTsErrors();

This script runs the `tsc --noEmit` command and displays the output in the console. You can use this script as a starting point to identify and fix TypeScript errors in your codebase.