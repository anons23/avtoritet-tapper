import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const manifestPath = path.join(
  process.cwd(),
  'android',
  'app',
  'src',
  'main',
  'AndroidManifest.xml'
);

let xml;
try {
  xml = await readFile(manifestPath, 'utf8');
} catch {
  console.log('Android manifest not found yet; run npm run android:add first.');
  process.exit(0);
}

const activityPattern = /<activity\b([^>]*\bandroid:name="(?:\.?MainActivity|[^"]*\.MainActivity)"[^>]*)>/;
const match = xml.match(activityPattern);

if (!match) {
  console.error('Could not find the Capacitor MainActivity in AndroidManifest.xml; set android:screenOrientation="portrait" manually.');
  process.exitCode = 1;
} else if (/\bandroid:screenOrientation=/.test(match[1])) {
  xml = xml.replace(activityPattern, (whole, attrs) =>
    '<activity' + attrs.replace(/\bandroid:screenOrientation="[^"]*"/, 'android:screenOrientation="portrait"') + '>'
  );
  await writeFile(manifestPath, xml);
  console.log('MainActivity orientation set to portrait.');
} else {
  xml = xml.replace(activityPattern, (whole, attrs) =>
    '<activity' + attrs + ' android:screenOrientation="portrait">'
  );
  await writeFile(manifestPath, xml);
  console.log('MainActivity orientation set to portrait.');
}
