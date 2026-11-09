// Genera le icone dell'app (2.0): la predefinita «Collezione» e le 6 alternative.
//
//   node scripts/generate-app-icons.mjs
//
// Disegna ogni icona come SVG e la trasforma in PNG con Playwright (Chromium), che deve essere
// installato a parte (`npm i -g playwright && npx playwright install chromium`).
//
// Scrive, per ogni icona alternativa, in `assets/images/app-icons/`:
//   - `<id>.png`             1024 px, opaca: icona iOS
//   - `<id>-foreground.png`  1024 px, livello in primo piano dell'icona adattiva Android
//   - `<id>-preview.png`     192 px con gli angoli arrotondati: anteprima nella schermata Temi
// e per la predefinita sostituisce `icon.png`, `android-icon-*.png` e `favicon.png`.
// I nomi nativi (`Classic`, `ShinyGold`…) sono quelli dichiarati in `app.json` e usati da
// `src/purchases/appIcon.ts`.

import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = new URL('../assets/images/', import.meta.url);
const ICONS_DIR = new URL('app-icons/', OUT);

/**
 * Le icone. `ball`: colori della Poké Ball (metà alta, metà bassa, contorno, anello del
 * pulsante, pulsante, punto centrale). `bg`: sfondo a gradiente (da alto a sinistra a basso a
 * destra); `androidBg` è il colore pieno dietro all'icona adattiva, se il primo piano non copre.
 */
const ICONS = [
  {
    id: 'collection',
    bg: ['#F5532F', '#A11E0A'],
    ball: { top: '#141318', bottom: '#F2F0F6', ink: '#141318', ring: '#141318', button: '#F2F0F6', dot: '#C9C6CF' },
  },
  {
    id: 'classic',
    bg: ['#F4F2EE', '#E9E6DF'],
    ball: { top: '#E3350D', bottom: '#FFFFFF', ink: '#1D1C22', ring: '#1D1C22', button: '#FFFFFF', dot: '#C9C6CF' },
  },
  {
    id: 'night',
    bg: ['#18171C', '#0E0D11'],
    ball: { top: '#FF5A3C', bottom: '#2B2A31', ink: '#F2F0F6', ring: '#F2F0F6', button: '#2B2A31', dot: '#5A5862' },
  },
  {
    id: 'shinyGold',
    bg: ['#3D2F14', '#17130B'],
    ball: { top: '#E8B830', bottom: '#F8F0DA', ink: '#15120C', ring: '#15120C', button: '#F8F0DA', dot: '#C8BC9C' },
  },
  {
    id: 'retro',
    bg: ['#D4DEAE', '#C3CF98'],
    ball: { top: '#3E6B1F', bottom: '#E2EAC4', ink: '#1C2F10', ring: '#1C2F10', button: '#E2EAC4', dot: '#A9B88A' },
  },
  {
    id: 'spectre',
    bg: ['#3D2265', '#140D24'],
    ball: { top: '#E64FD1', bottom: '#2C2245', ink: '#F2EBFF', ring: '#F2EBFF', button: '#2C2245', dot: '#5E5180' },
  },
  { id: 'device', bg: ['#D7193A', '#B00C29'], device: true },
];

const native = (id) => id[0].toUpperCase() + id.slice(1);

function background({ bg }) {
  return `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/>
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#bg)"/>`;
}

/** La Poké Ball, centrata, con raggio esterno `r`. */
function ball({ ball: c }, r) {
  const stroke = r * 0.13;
  const inner = r - stroke / 2;
  const band = r * 0.13;
  return `
    <clipPath id="ballClip"><circle cx="512" cy="512" r="${inner}"/></clipPath>
    <circle cx="512" cy="${512 + r * 0.06}" r="${r}" fill="#000" opacity="0.22"/>
    <g clip-path="url(#ballClip)">
      <rect x="0" y="0" width="1024" height="512" fill="${c.top}"/>
      <rect x="0" y="512" width="1024" height="512" fill="${c.bottom}"/>
      <rect x="0" y="${512 - band / 2}" width="1024" height="${band}" fill="${c.ink}"/>
    </g>
    <circle cx="512" cy="512" r="${inner}" fill="none" stroke="${c.ink}" stroke-width="${stroke}"/>
    <circle cx="512" cy="512" r="${r * 0.34}" fill="${c.ring}"/>
    <circle cx="512" cy="512" r="${r * 0.22}" fill="${c.button}"/>
    <circle cx="512" cy="512" r="${r * 0.12}" fill="${c.dot}"/>`;
}

/** L'icona «Dispositivo»: un Pokédex portatile con lente, spie e schermo «DEX». */
function device(scale) {
  // Disegnato su 1024 e poi ridotto attorno al centro per il primo piano Android.
  const pixel = (x, y) => `<rect x="${x}" y="${y}" width="16" height="16"/>`;
  const glyphs = {
    D: ['1110', '1001', '1001', '1001', '1110'],
    E: ['1111', '1000', '1110', '1000', '1111'],
    X: ['1001', '0110', '0110', '0110', '1001'],
  };
  let text = '';
  ['D', 'E', 'X'].forEach((letter, index) => {
    glyphs[letter].forEach((row, y) =>
      [...row].forEach((on, x) => {
        if (on === '1') text += pixel(400 + index * 80 + x * 16, 572 + y * 16);
      }),
    );
  });
  return `
    <g transform="translate(512 512) scale(${scale}) translate(-512 -512)">
      <circle cx="262" cy="262" r="118" fill="#F4F1E8"/>
      <circle cx="262" cy="262" r="92" fill="#1E88E5"/>
      <circle cx="262" cy="262" r="92" fill="none" stroke="#0D5DB0" stroke-width="10"/>
      <circle cx="226" cy="226" r="28" fill="#BFE3FF"/>
      <circle cx="476" cy="200" r="26" fill="#FF4D4D"/>
      <circle cx="560" cy="200" r="26" fill="#FFD23F"/>
      <circle cx="644" cy="200" r="26" fill="#3DDC6B"/>
      <rect x="226" y="436" width="572" height="380" rx="44" fill="#F1EDE2"/>
      <rect x="276" y="486" width="472" height="280" rx="18" fill="#1C2620"/>
      <g fill="#9BE07A">${text}</g>
    </g>`;
}

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${body}</svg>`;

/** Icona iOS (e quella generica di Expo): tutto pieno, iOS arrotonda gli angoli da sé. */
const fullIcon = (icon) => svg(background(icon) + (icon.device ? device(1) : ball(icon, 344)));

/**
 * Primo piano Android: lo sfondo copre tutto il livello (108 dp) e il disegno sta nella zona
 * sicura centrale (66 dp di diametro su 108, il resto può essere tagliato dalla maschera).
 */
const foreground = (icon) => svg(background(icon) + (icon.device ? device(0.68) : ball(icon, 268)));

/** Solo lo sfondo, per il livello di sfondo Android della predefinita. */
const backgroundOnly = (icon) => svg(background(icon));

/** Icona monocromatica Android 13+ (icone a tema): sagoma della Poké Ball. */
const monochrome = () =>
  svg(`
    <mask id="m">
      <rect width="1024" height="1024" fill="#000"/>
      <circle cx="512" cy="512" r="268" fill="#fff"/>
      <rect x="0" y="494" width="1024" height="36" fill="#000"/>
      <circle cx="512" cy="512" r="96" fill="#000"/>
      <circle cx="512" cy="512" r="60" fill="#fff"/>
    </mask>
    <rect width="1024" height="1024" fill="#000" mask="url(#m)"/>`);

async function render(page, markup, size, { transparent = false, rounded = false } = {}) {
  const radius = rounded ? size * 0.225 : 0;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">
      <div style="width:${size}px;height:${size}px;overflow:hidden;border-radius:${radius}px">
        ${markup.replace('width="1024" height="1024"', `width="${size}" height="${size}"`)}
      </div></body></html>`,
  );
  return page.screenshot({ omitBackground: transparent || rounded, type: 'png' });
}

const browser = await chromium.launch();
const page = await browser.newPage();
await mkdir(ICONS_DIR, { recursive: true });

for (const icon of ICONS) {
  await writeFile(new URL(`${icon.id}-preview.png`, ICONS_DIR), await render(page, fullIcon(icon), 192, { rounded: true }));
  if (icon.id === 'collection') {
    await writeFile(new URL('icon.png', OUT), await render(page, fullIcon(icon), 1024));
    await writeFile(new URL('android-icon-foreground.png', OUT), await render(page, foreground(icon), 512));
    await writeFile(new URL('android-icon-background.png', OUT), await render(page, backgroundOnly(icon), 512));
    await writeFile(new URL('android-icon-monochrome.png', OUT), await render(page, monochrome(), 432, { transparent: true }));
    await writeFile(new URL('favicon.png', OUT), await render(page, fullIcon(icon), 48));
  } else {
    await writeFile(new URL(`${icon.id}.png`, ICONS_DIR), await render(page, fullIcon(icon), 1024));
    await writeFile(new URL(`${icon.id}-foreground.png`, ICONS_DIR), await render(page, foreground(icon), 1024));
    console.log(`${native(icon.id)}: android backgroundColor ${icon.bg[1]}`);
  }
}

await browser.close();
console.log('Icone generate in assets/images/');
