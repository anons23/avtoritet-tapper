import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const webDir = path.join(root, 'www');
const excluded = new Set([
  '.git',
  '.github',
  'android',
  'ios',
  'node_modules',
  'www',
  'scripts',
  'package.json',
  'package-lock.json',
  'capacitor.config.ts',
  'README-ANDROID.md'
]);

await rm(webDir, { recursive: true, force: true });
await mkdir(webDir, { recursive: true });

for (const entry of await readdir(root)) {
  if (excluded.has(entry)) continue;
  const source = path.join(root, entry);
  const destination = path.join(webDir, entry);
  const info = await stat(source);
  if (info.isDirectory()) {
    await cp(source, destination, { recursive: true });
  } else if (info.isFile()) {
    await cp(source, destination);
  }
}

console.log('Prepared web game in ./www for Capacitor.');
