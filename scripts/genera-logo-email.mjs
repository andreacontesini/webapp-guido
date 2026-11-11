// Genera il logo PNG usato nelle email (i client di posta non mostrano SVG).
// Stesso segno della sidebar: casa bianca (icona Lucide "house") su quadrato blu.
// Uso: node scripts/genera-logo-email.mjs
import sharp from "sharp";

const lato = 96; // mostrato a 48 px: 2x per schermi ad alta densità
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${lato}" height="${lato}" viewBox="0 0 40 40">
  <rect width="40" height="40" rx="8" fill="#2b5bd7"/>
  <g transform="translate(8 8)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile("public/email/logo.png");
console.log("Creato public/email/logo.png");
