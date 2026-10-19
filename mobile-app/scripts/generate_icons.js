const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

// Exact path from MaterialSymbolsPrayerTimesOutlineRounded.svg
const emblemPath = "M8.65 20H6q-.825 0-1.412-.587T4 18v-2.65L2.075 13.4q-.275-.3-.425-.662T1.5 12t.15-.737t.425-.663L4 8.65V6q0-.825.588-1.412T6 4h2.65l1.95-1.925q.3-.275.663-.425T12 1.5t.738.15t.662.425L15.35 4H18q.825 0 1.413.588T20 6v2.65l1.925 1.95q.275.3.425.663t.15.737t-.15.738t-.425.662L20 15.35V18q0 .825-.587 1.413T18 20h-2.65l-1.95 1.925q-.3.275-.662.425T12 22.5t-.737-.15t-.663-.425zm.85-2l2.5 2.5l2.5-2.5H18v-3.5l2.5-2.5L18 9.5V6h-3.5L12 3.5L9.5 6H6v3.5L3.5 12L6 14.5V18zm3.525-6.5l1.475-1.075l1.45 1.075l-.575-1.7l1.475-1.075h-1.8L14.5 7l-.55 1.725h-1.825L13.6 9.8zM12 17q2.075 0 3.538-1.45T17 12q0-.2-.012-.4t-.063-.4q-.275 1.175-1.225 1.938t-2.225.762q-1.5 0-2.525-1.025T9.925 10.35q0-1.15.65-2.062T12.275 7H12Q9.9 7 8.45 8.463T7 12q0 2.1 1.45 3.55T12 17";

const createSvg = (size, isForeground = false) => {
  // Scale 24x24 viewBox to ~540px centered inside 1024x1024
  const targetSize = 540;
  const scale = targetSize / 24; // 22.5
  const offset = (1024 - targetSize) / 2; // 242

  return `
<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#065F46" />
      <stop offset="50%" stop-color="#044E39" />
      <stop offset="100%" stop-color="#022C22" />
    </linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#10B981" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  ${isForeground ? '' : `<rect width="1024" height="1024" rx="220" fill="url(#bgGrad)" />`}
  ${isForeground ? '' : `<circle cx="512" cy="512" r="420" fill="url(#glowGrad)" />`}

  <!-- Subtle glowing circle boundary -->
  ${isForeground ? '' : `
  <circle cx="512" cy="512" r="340" fill="none" stroke="#10B981" stroke-width="3" stroke-dasharray="10 10" opacity="0.3"/>
  `}

  <!-- Center Islamic Rub el Hizb + Crescent & Star Symbol from SVG -->
  <g filter="url(#shadow)" transform="translate(${offset}, ${offset}) scale(${scale})">
    <path fill="#FFFFFF" d="${emblemPath}" />
  </g>
</svg>`;
};

const renderPng = (svgStr, size, outPath) => {
  const resvg = new Resvg(svgStr, { fitTo: { mode: 'width', value: size } });
  const pngData = resvg.render().asPng();
  fs.writeFileSync(outPath, pngData);
  console.log(`Generated: ${outPath} (${pngData.length} bytes)`);
};

const assetsDir = path.join(__dirname, '..', 'assets');

renderPng(createSvg(1024, false), 1024, path.join(assetsDir, 'icon.png'));
renderPng(createSvg(1024, false), 1024, path.join(assetsDir, 'splash-icon.png'));
renderPng(createSvg(1024, true), 1024, path.join(assetsDir, 'android-icon-foreground.png'));
renderPng(`
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#044E39"/>
</svg>
`, 1024, path.join(assetsDir, 'android-icon-background.png'));
renderPng(createSvg(1024, false), 48, path.join(assetsDir, 'favicon.png'));

console.log('App icons updated with Islamic Rub el Hizb / Prayer Times emblem!');
