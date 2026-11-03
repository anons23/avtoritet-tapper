import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const androidRoot = path.join(root, 'android');

async function exists(p) {
  try { await readFile(p); return true; } catch { return false; }
}

async function readAppId() {
  const candidates = [
    path.join(androidRoot, 'app', 'build.gradle'),
    path.join(androidRoot, 'app', 'build.gradle.kts')
  ];
  for (const g of candidates) {
    try {
      const text = await readFile(g, 'utf8');
      const m = text.match(/applicationId\s*[=\s]\s*["']([^"']+)["']/);
      if (m) return m[1];
    } catch {}
  }
  return 'ru.avtoritet.game';
}

async function findMainActivity(dir, depth = 0) {
  if (depth > 8) return null;
  let entries = [];
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isFile() && (e.name === 'MainActivity.java' || e.name === 'MainActivity.kt')) return p;
    if (e.isDirectory() && e.name !== 'build' && e.name !== '.gradle') {
      const found = await findMainActivity(p, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

const appId = await readAppId();
const pluginPackage = appId;
const pluginDir = path.join(
  androidRoot, 'app', 'src', 'main', 'java', ...pluginPackage.split('.')
);
await mkdir(pluginDir, { recursive: true });

const activityPath = (await findMainActivity(path.join(androidRoot, 'app', 'src', 'main')));
if (!activityPath || !(await exists(activityPath))) {
  throw new Error('MainActivity not found under android/app/src/main. Run cap add android first.');
}

let activity = await readFile(activityPath, 'utf8');
const isKotlin = activityPath.endsWith('.kt');

if (!activity.includes('YandexAdsPlugin')) {
  if (isKotlin) {
    if (!/override\s+fun\s+onCreate/.test(activity)) {
      activity = activity.replace(
        /class\s+MainActivity[^{]*\{/,
        (m) => m + `\n    override fun onCreate(savedInstanceState: android.os.Bundle?) {\n        registerPlugin(YandexAdsPlugin::class.java)\n        super.onCreate(savedInstanceState)\n    }\n`
      );
    } else if (!activity.includes('registerPlugin(YandexAdsPlugin')) {
      activity = activity.replace(
        /override\s+fun\s+onCreate\s*\([^)]*\)\s*\{/,
        (m) => m + '\n        registerPlugin(YandexAdsPlugin::class.java)'
      );
    }
  } else {
    if (!activity.includes('import android.os.Bundle')) {
      activity = activity.replace(/package\s+[^;]+;/, (m) => m + '\n\nimport android.os.Bundle;');
    }
    if (!/void\s+onCreate\s*\(/.test(activity)) {
      activity = activity.replace(/}\s*$/,
        '\n    @Override\n    public void onCreate(Bundle savedInstanceState) {\n        registerPlugin(YandexAdsPlugin.class);\n        super.onCreate(savedInstanceState);\n    }\n}\n');
    } else if (!activity.includes('registerPlugin(YandexAdsPlugin')) {
      activity = activity.replace(
        /void\s+onCreate\s*\([^)]*\)\s*\{/,
        (m) => m + '\n        registerPlugin(YandexAdsPlugin.class);'
      );
    }
  }
}

if (!activity.includes('YandexAdsPlugin')) {
  throw new Error('Failed to register YandexAdsPlugin in MainActivity: ' + activityPath);
}
await writeFile(activityPath, activity);
console.log('Registered YandexAdsPlugin in', activityPath);

const template = await readFile(path.join(root, 'android-ads', 'YandexAdsPlugin.java.template'), 'utf8');
const pluginJava = template.replaceAll('__PACKAGE__', pluginPackage);
await writeFile(path.join(pluginDir, 'YandexAdsPlugin.java'), pluginJava);
console.log('Wrote', path.join(pluginDir, 'YandexAdsPlugin.java'));

const gradleCandidates = [
  path.join(androidRoot, 'app', 'build.gradle'),
  path.join(androidRoot, 'app', 'build.gradle.kts')
];
let gradlePath = null;
for (const candidate of gradleCandidates) {
  if (await exists(candidate)) { gradlePath = candidate; break; }
}
if (!gradlePath) throw new Error('android/app/build.gradle not found');

let gradle = await readFile(gradlePath, 'utf8');
if (!gradle.includes('com.yandex.android:mobileads')) {
  if (gradlePath.endsWith('.kts')) {
    gradle = gradle.replace(/dependencies\s*\{/, 'dependencies {\n    implementation("com.yandex.android:mobileads:8.6.0")');
  } else {
    gradle = gradle.replace(/dependencies\s*\{/, "dependencies {\n    implementation 'com.yandex.android:mobileads:8.6.0'");
  }
  if (!gradle.includes('com.yandex.android:mobileads')) {
    throw new Error('Could not inject Yandex mobileads dependency');
  }
  await writeFile(gradlePath, gradle);
  console.log('Added Yandex Mobile Ads SDK 8.6.0 to', gradlePath);
} else {
  console.log('Yandex mobileads dependency already present');
}

const manifestPath = path.join(androidRoot, 'app', 'src', 'main', 'AndroidManifest.xml');
if (await exists(manifestPath)) {
  let xml = await readFile(manifestPath, 'utf8');
  let changed = false;
  for (const p of ['android.permission.INTERNET', 'android.permission.ACCESS_NETWORK_STATE']) {
    if (!xml.includes(p)) {
      xml = xml.replace(/<manifest\b[^>]*>/, (m) => m + `\n    <uses-permission android:name="${p}" />`);
      changed = true;
    }
  }
  if (changed) {
    await writeFile(manifestPath, xml);
    console.log('Added INTERNET / ACCESS_NETWORK_STATE to AndroidManifest');
  }
}

console.log('Yandex Ads bridge configured. applicationId/package expected:', appId);
console.log('Make sure partner.yandex.ru package matches this applicationId exactly.');
