// Run only when updating bundled PDF assets. Production PDF generation does not
// fetch remote content or depend on writable disk / a browser binary.
import { readFile, writeFile } from 'node:fs/promises';
const assets = {};
const sources = {
  pangong: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Pangong_Lake%2C_Ladakh%2C_India_02.jpg',
  regular: 'https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf',
  bold: 'https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf',
};
for (const [name, url] of Object.entries(sources)) {
  const response = await fetch(url, { headers: { 'User-Agent': 'JournAway/1.0 (trip itinerary assets)' }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  assets[name] = Buffer.from(await response.arrayBuffer()).toString('base64');
}
assets.logo = (await readFile(new URL('../public/journaway-logo-transparent.png', import.meta.url))).toString('base64');
await writeFile(new URL('../lib/trip-pdf-assets.json', import.meta.url), JSON.stringify(assets));
const license = await fetch('https://raw.githubusercontent.com/notofonts/noto-fonts/main/LICENSE');
if (!license.ok) throw new Error('Font license could not be downloaded');
await writeFile(new URL('../lib/trip-pdf-font-license.txt', import.meta.url), await license.text());
console.log('Bundled logo, Pangong Lake photo and Noto Sans fonts for PDF generation.');
