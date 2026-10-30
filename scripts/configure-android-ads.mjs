import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const androidRoot = path.join(root, 'android');
const sourceRoot = path.join(androidRoot, 'app', 'src', 'main', 'java');

async function findMainActivity(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return null; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = await findMainActivity(full);
      if (found) return found;
    } else if (entry.name === 'MainActivity.java') return full;
  }
  return null;
}

const activityPath = await findMainActivity(sourceRoot);
if (!activityPath) throw new Error('MainActivity.java не найден. Сначала создай Android-проект командой npm run android:add.');

let activity = await readFile(activityPath, 'utf8');
const packageMatch = activity.match(/^package\s+([\w.]+);/m);
if (!packageMatch) throw new Error('Не удалось определить package в MainActivity.java.');

const pluginPackage = packageMatch[1] + '.ads';
const pluginDir = path.join(sourceRoot, ...pluginPackage.split('.'));
await mkdir(pluginDir, { recursive: true });

const importLine = 'import ' + pluginPackage + '.YandexAdsPlugin;';
if (!activity.includes(importLine)) {
  activity = activity.replace(/(package\s+[\w.]+;\s*)/, '$1\n' + importLine + '\n');
}
if (!activity.includes('registerPlugin(YandexAdsPlugin.class)')) {
  activity = activity.replace(/(public\s+void\s+onCreate\s*\([^)]*\)\s*\{)/, '$1\n        registerPlugin(YandexAdsPlugin.class);');
}
if (!activity.includes('registerPlugin(YandexAdsPlugin.class)')) {
  throw new Error('Не удалось зарегистрировать YandexAdsPlugin в MainActivity.');
}
await writeFile(activityPath, activity);

const template = await readFile(path.join(root, 'android-ads', 'YandexAdsPlugin.java.template'), 'utf8');
await writeFile(path.join(pluginDir, 'YandexAdsPlugin.java'), template.replaceAll('__PACKAGE__', pluginPackage));

const gradleCandidates = [
  path.join(androidRoot, 'app', 'build.gradle'),
  path.join(androidRoot, 'app', 'build.gradle.kts')
];
let gradlePath = null;
for (const candidate of gradleCandidates) {
  try { await readFile(candidate, 'utf8'); gradlePath = candidate; break; } catch {}
}
if (!gradlePath) throw new Error('Не найден android/app/build.gradle(.kts).');

let gradle = await readFile(gradlePath, 'utf8');
if (!gradle.includes('com.yandex.android:mobileads')) {
  if (gradlePath.endsWith('.kts')) {
    gradle = gradle.replace(/dependencies\s*\{/, 'dependencies {\n    implementation("com.yandex.android:mobileads:8.6.0")');
  } else {
    gradle = gradle.replace(/dependencies\s*\{/, "dependencies {\n    implementation 'com.yandex.android:mobileads:8.6.0'");
  }
}
await writeFile(gradlePath, gradle);
console.log('Yandex Mobile Ads SDK 8.6.0 и Capacitor-мост подключены к Android-проекту.');
