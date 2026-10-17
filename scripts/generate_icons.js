const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const createSvg = (size, isForeground = false) => `
<svg width="${size}" height="${size}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#065F46" />
      <stop offset="50%" stop-color="#044E39" />
      <stop offset="100%" stop-color="#022C22" />
    </linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.35"/>
      <stop offset="70%" stop-color="#10B981" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>

  ${isForeground ? '' : `<rect width="1024" height="1024" rx="220" fill="url(#bgGrad)" />`}
  ${isForeground ? '' : `<circle cx="512" cy="480" r="380" fill="url(#glowGrad)" />`}

  <!-- Islamic decorative arch line -->
  ${isForeground ? '' : `
  <path d="M 280 780 C 280 400, 512 280, 512 280 C 512 280, 744 400, 744 780" 
        fill="none" stroke="#10B981" stroke-width="6" stroke-dasharray="14 14" opacity="0.3"/>
  `}

  <!-- Dua / Supplication Praying Hands (Two hands cupped upwards) -->
  <g filter="url(#shadow)">
    <!-- Left Hand -->
    <path d="M 490 730 
             C 475 730, 440 710, 410 670 
             C 375 625, 350 560, 345 490 
             C 340 435, 352 380, 372 360 
             C 385 345, 408 350, 415 375 
             C 422 400, 432 475, 442 510 
             C 442 450, 450 330, 470 310 
             C 482 295, 502 302, 504 328 
             C 507 360, 500 480, 505 525 
             C 505 525, 498 730, 490 730 Z" 
          fill="#FFFFFF" />

    <!-- Right Hand (Symmetrical) -->
    <path d="M 534 730 
             C 549 730, 584 710, 614 670 
             C 649 625, 674 560, 679 490 
             C 684 435, 672 380, 652 360 
             C 639 345, 616 350, 609 375 
             C 602 400, 592 475, 582 510 
             C 582 450, 574 330, 554 310 
             C 542 295, 522 302, 520 328 
             C 517 360, 524 480, 519 525 
             C 519 525, 526 730, 534 730 Z" 
          fill="#FFFFFF" />

    <!-- Inner palm crease and lower joint -->
    <path d="M 420 680 C 460 750, 564 750, 604 680 C 564 715, 460 715, 420 680 Z" fill="#E2E8F0"/>

    <!-- Light glow emblem / Crescent above -->
    <path d="M 512 180 A 40 40 0 0 0 540 250 A 48 48 0 1 1 512 180 Z" fill="#34D399" />
    <polygon points="542,205 545,215 556,215 547,222 550,232 542,226 534,232 537,222 528,215 539,215" fill="#34D399" />
  </g>
</svg>`;

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

console.log('All icons generated successfully!');
