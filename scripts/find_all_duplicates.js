const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, fileList);
    } else {
      fileList.push(name);
    }
  });
  return fileList;
}

function getHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

const publicDir = path.join(process.cwd(), 'web', 'public');
const files = getFiles(publicDir);
const hashes = {};
const duplicates = {};

files.forEach(file => {
  const hash = getHash(file);
  const relativePath = path.relative(path.join(process.cwd(), 'web'), file);
  if (!hashes[hash]) {
    hashes[hash] = [];
  }
  hashes[hash].push(relativePath);
});

Object.keys(hashes).forEach(hash => {
  if (hashes[hash].length > 1) {
    duplicates[hash] = hashes[hash];
  }
});

console.log(JSON.stringify({ duplicates, totalFiles: files.length }, null, 2));
