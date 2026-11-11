import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { scriptTemaIniziale } from "@/lib/tema";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vendere Casa da Privato",
    template: "%s | Vendere Casa da Privato",
  },
  description:
    "La guida e il videocorso di Guido Contesini per vendere casa da privato, in autonomia e senza errori.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Colore della barra del browser su mobile: segue il tema scuro predefinito.
  themeColor: "#0e1116",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Il tema scuro è il predefinito: `dark` è già nell'HTML del server.
    // suppressHydrationWarning: lo script del tema può cambiare la classe
    // (e color-scheme) di <html> prima che React si avvii. Vale solo per <html>.
    <html
      lang="it"
      className={`${geist.variable} ${geistMono.variable} dark h-full antialiased`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTemaIniziale }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
