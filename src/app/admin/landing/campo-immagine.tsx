"use client";

import { useId, useRef, useState } from "react";
import { ImageIcon, LoaderIcon, Trash2Icon, UploadIcon } from "lucide-react";

import { preparaCaricamentoImmagine } from "@/app/admin/landing/azioni";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BUCKET_LANDING } from "@/lib/bucket";
import { creaClientBrowser } from "@/lib/supabase/client";

/**
 * Campo immagine dell'editor: carica un file nel bucket pubblico delle landing
 * (direttamente dal browser, con un URL firmato dal server) oppure accetta un
 * indirizzo https incollato.
 */
export function CampoImmagine({
  valore,
  onChange,
  idCampo,
}: {
  valore: string;
  onChange: (url: string) => void;
  idCampo?: string;
}) {
  const idFile = useId();
  const input = useRef<HTMLInputElement>(null);
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string>();

  async function carica(file: File) {
    setErrore(undefined);
    setInCorso(true);
    try {
      const preparazione = await preparaCaricamentoImmagine({ tipo: file.type, dimensione: file.size });
      if (preparazione.errore !== undefined) {
        setErrore(preparazione.errore);
        return;
      }
      const { error } = await creaClientBrowser()
        .storage.from(BUCKET_LANDING)
        .uploadToSignedUrl(preparazione.percorso, preparazione.token, file, {
          contentType: file.type,
          cacheControl: "31536000",
        });
      if (error) {
        console.error(error);
        setErrore("Caricamento non riuscito. Controlla la connessione e riprova.");
        return;
      }
      onChange(preparazione.url);
    } finally {
      setInCorso(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {valore ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={valore} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-5 text-muted-foreground" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            id={idCampo}
            value={valore}
            placeholder="https://… oppure carica un file"
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <input
              ref={input}
              id={idFile}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              className="sr-only"
              disabled={inCorso}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void carica(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={inCorso}
              onClick={() => input.current?.click()}
            >
              {inCorso ? (
                <LoaderIcon className="animate-spin" aria-hidden />
              ) : (
                <UploadIcon aria-hidden />
              )}
              {inCorso ? "Caricamento…" : "Carica immagine"}
            </Button>
            {valore && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
                <Trash2Icon aria-hidden />
                Rimuovi
              </Button>
            )}
          </div>
        </div>
      </div>
      {errore && (
        <p role="alert" className="text-xs text-destructive">
          {errore}
        </p>
      )}
    </div>
  );
}
