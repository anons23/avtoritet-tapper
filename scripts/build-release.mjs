// Собирает подписанный release APK для RuStore.
// Запуск: npm run android:release
import { spawnSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const androidDir = path.join(root, 'android');

try { await access(androidDir); } catch {
  console.error('Папки android нет. Сначала выполни: npm run android:add');
  process.exit(1);
}
try { await access(path.join(root, 'keystore.properties')); } catch {
  console.error('Нет файла keystore.properties в корне проекта — без него APK будет без подписи и RuStore его не примет.');
  console.error('Смотри RELEASE-RUSTORE.md, шаг 2.');
  process.exit(1);
}

const isWin = process.platform === 'win32';
const gradlew = isWin ? 'gradlew.bat' : './gradlew';
const result = spawnSync(gradlew, ['assembleRelease'], { cwd: androidDir, stdio: 'inherit', shell: isWin });
if (result.status !== 0) {
  console.error('Сборка не удалась — смотри ошибки выше.');
  process.exit(result.status || 1);
}

const release = JSON.parse(await readFile(path.join(root, 'android-release.json'), 'utf8'));
const apk = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
console.log('\nГотово! Версия ' + release.versionName + ' (versionCode ' + release.versionCode + ')');
console.log('APK для RuStore: ' + apk);
