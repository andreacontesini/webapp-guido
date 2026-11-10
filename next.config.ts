import path from "node:path";
import type { NextConfig } from "next";

// Radice del progetto: evita che Next.js scelga per errore un lockfile
// esterno (es. ~/package-lock.json) come radice del workspace.
const radiceProgetto = path.resolve(__dirname);

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingRoot: radiceProgetto,
  // In basso a sinistra coprirebbe il piede della sidebar.
  devIndicators: { position: "bottom-right" },
  turbopack: {
    root: radiceProgetto,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
