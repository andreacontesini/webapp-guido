"use client";

import { useEffect } from "react";

/**
 * Conta una visita alla landing (una per caricamento della pagina).
 * Nessun cookie né dato personale: si invia solo l'id della landing.
 */
export function ContaVisita({ landing }: { landing: string }) {
  useEffect(() => {
    const corpo = new Blob([JSON.stringify({ landing })], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/landing/visita", corpo)) {
      void fetch("/api/landing/visita", { method: "POST", body: corpo, keepalive: true }).catch(
        () => {},
      );
    }
  }, [landing]);
  return null;
}
