import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'manifest.json');

function fail(message) {
  throw new Error(message);
}

function requireFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    fail(`Missing manifest file: ${relativePath}`);
  }
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (error) {
  fail(`Could not parse manifest.json: ${error.message}`);
}

if (manifest.manifest_version !== 3) {
  fail('manifest.json must use Manifest V3.');
}

if (!manifest.name || !manifest.version || !manifest.description) {
  fail('manifest.json must include name, version, and description.');
}

const referencedFiles = new Set();

for (const file of Object.values(manifest.icons || {})) {
  referencedFiles.add(file);
}

if (manifest.action?.default_popup) {
  referencedFiles.add(manifest.action.default_popup);
}

if (manifest.action?.default_icon) {
  for (const file of Object.values(manifest.action.default_icon)) {
    referencedFiles.add(file);
  }
}

if (manifest.background?.service_worker) {
  referencedFiles.add(manifest.background.service_worker);
}

for (const contentScript of manifest.content_scripts || []) {
  for (const file of [...(contentScript.js || []), ...(contentScript.css || [])]) {
    referencedFiles.add(file);
  }
}

for (const resourceGroup of manifest.web_accessible_resources || []) {
  for (const file of resourceGroup.resources || []) {
    referencedFiles.add(file);
  }
}

for (const file of referencedFiles) {
  requireFile(file);
}

const javascriptFiles = [
  'background.js',
  'content.js',
  'page-interceptor.js',
  'popup.js'
];

for (const file of javascriptFiles) {
  requireFile(file);
  const result = spawnSync(process.execPath, ['--check', path.join(root, file)], {
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || 'Unknown syntax error\n');
    fail(`JavaScript syntax check failed: ${file}`);
  }
}

console.log(`Extension validation passed: ${referencedFiles.size} manifest files and ${javascriptFiles.length} JavaScript files checked.`);
