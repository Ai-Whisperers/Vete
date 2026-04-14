const { exec } = require('child_process');

exec('npx lighthouse-ci', (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});

NEEDS_MANUAL_REVIEW for further configurations and integrations with the existing codebase and CI/CD pipeline.