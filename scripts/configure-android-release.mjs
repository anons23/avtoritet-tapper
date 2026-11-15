// Настраивает android/app/build.gradle для релиза в RuStore:
//  1) versionCode / versionName из android-release.json;
//  2) подпись release-сборки ключом из keystore.properties (лежит в корне проекта, НЕ в git).
// Скрипт можно запускать повторно — он ничего не дублирует.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');

let gradle;
try {
  gradle = await readFile(gradlePath, 'utf8');
} catch {
  console.log('android/app/build.gradle not found yet; run npm run android:add first.');
  process.exit(0);
}

const release = JSON.parse(await readFile(path.join(root, 'android-release.json'), 'utf8'));
const versionCode = Number(release.versionCode);
const versionName = String(release.versionName || '').trim();
if (!Number.isInteger(versionCode) || versionCode < 1) throw new Error('android-release.json: versionCode must be a positive integer');
if (!versionName) throw new Error('android-release.json: versionName is empty');

// --- 1. Версия ---
const codeRe = /(\bversionCode\s*=?\s*)\d+/;
const nameRe = /(\bversionName\s*=?\s*)["'][^"']*["']/;
if (!codeRe.test(gradle) || !nameRe.test(gradle)) {
  throw new Error('versionCode/versionName not found in android/app/build.gradle — set them manually');
}
gradle = gradle.replace(codeRe, `$1${versionCode}`).replace(nameRe, `$1"${versionName}"`);

// --- 2. Подпись ---
const BEGIN = '// >>> avtoritet-release-signing';
const END = '// <<< avtoritet-release-signing';

const propsBlock = `${BEGIN}
def avtKeystorePropsFile = rootProject.file("../keystore.properties")
def avtKeystoreProps = new Properties()
if (avtKeystorePropsFile.exists()) {
    avtKeystorePropsFile.withInputStream { avtKeystoreProps.load(it) }
}
${END}
`;

const signingBlock = `    ${BEGIN}
    signingConfigs {
        release {
            if (avtKeystorePropsFile.exists()) {
                storeFile file(avtKeystoreProps['storeFile'])
                storePassword avtKeystoreProps['storePassword']
                keyAlias avtKeystoreProps['keyAlias']
                keyPassword avtKeystoreProps['keyPassword']
            }
        }
    }
    ${END}
`;

if (!gradle.includes(BEGIN)) {
  if (!/^android\s*\{/m.test(gradle)) throw new Error('android { block not found in build.gradle');
  gradle = gradle.replace(/^android\s*\{/m, (m) => propsBlock + '\n' + m);

  if (!/\n(\s*)buildTypes\s*\{/.test(gradle)) throw new Error('buildTypes { block not found in build.gradle');
  gradle = gradle.replace(/\n(\s*)buildTypes\s*\{/, (m) => '\n' + signingBlock + m);

  const releaseRe = /(buildTypes\s*\{[\s\S]*?\brelease\s*\{)/;
  if (!releaseRe.test(gradle)) throw new Error('buildTypes.release block not found in build.gradle');
  gradle = gradle.replace(releaseRe, (m) =>
    m + '\n            if (avtKeystorePropsFile.exists()) { signingConfig signingConfigs.release } // avtoritet-release-signing'
  );
}

await writeFile(gradlePath, gradle);

let hasKey = false;
try { await readFile(path.join(root, 'keystore.properties')); hasKey = true; } catch {}
console.log(`Release config: versionName=${versionName}, versionCode=${versionCode}`);
console.log(hasKey
  ? 'keystore.properties found — release build will be signed.'
  : 'WARNING: keystore.properties not found — release build will be UNSIGNED. See RELEASE-RUSTORE.md, step 2.');
