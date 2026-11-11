"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheckIcon, UploadIcon } from "lucide-react";

import { confermaCaricamento, preparaCaricamento } from "@/app/admin/guida/azioni";
import { Button } from "@/components/ui/button";
import { BUCKET_GUIDA } from "@/lib/bucket";
import { creaClientBrowser } from "@/lib/supabase/client";

type Stato =
  | { fase: "inattivo" }
  | { fase: "in-corso"; testo: string }
  | { fase: "completato"; nomeFile: string }
  | { fase: "errore"; testo: string };

/** I PDF iniziano sempre con "%PDF-": scarta file rinominati per errore. */
async function isPdf(file: File) {
  const intestazione = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return String.fromCharCode(...intestazione) === "%PDF-";
}

const formatoMb = (byte: number) =>
  `${(byte / 1024 / 1024).toLocaleString("it-IT", { maximumFractionDigits: 1 })} MB`;

/** Sostituisce il PDF della guida: caricamento diretto su Supabase Storage. */
export function CaricamentoPdf({ haGiaUnFile }: { haGiaUnFile: boolean }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stato, setStato] = useState<Stato>({ fase: "inattivo" });
  const inCorso = stato.fase === "in-corso";

  async function carica() {
    if (!file) return;
    if (file.type !== "application/pdf" || !(await isPdf(file))) {
      setStato({ fase: "errore", testo: "Il file selezionato non è un PDF valido." });
      return;
    }

    setStato({ fase: "in-corso", testo: "Preparazione…" });
    const preparazione = await preparaCaricamento({ tipo: file.type, dimensione: file.size });
    if (preparazione.errore !== undefined) {
      setStato({ fase: "errore", testo: preparazione.errore });
      return;
    }

    setStato({ fase: "in-corso", testo: `Caricamento di ${formatoMb(file.size)}…` });
    const { error } = await creaClientBrowser()
      .storage.from(BUCKET_GUIDA)
      .uploadToSignedUrl(preparazione.percorso, preparazione.token, file, {
        contentType: "application/pdf",
      });
    if (error) {
      console.error(error);
      setStato({ fase: "errore", testo: "Caricamento non riuscito. Controlla la connessione e riprova." });
      return;
    }

    setStato({ fase: "in-corso", testo: "Attivazione del nuovo PDF…" });
    const conferma = await confermaCaricamento(preparazione.percorso);
    if (conferma.errore) {
      setStato({ fase: "errore", testo: conferma.errore });
      return;
    }

    setStato({ fase: "completato", nomeFile: file.name });
    setFile(null);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="file-guida" className="text-sm font-medium">
          {haGiaUnFile ? "Sostituisci il PDF" : "Carica il PDF"}
        </label>
        <input
          ref={input}
          id="file-guida"
          type="file"
          accept="application/pdf,.pdf"
          disabled={inCorso}
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setStato({ fase: "inattivo" });
          }}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Solo PDF, massimo 50 MB.
          {haGiaUnFile && " Il nuovo file sostituisce subito quello attuale per tutti gli utenti."}
        </p>
      </div>

      <Button size="lg" onClick={carica} disabled={!file || inCorso}>
        <UploadIcon aria-hidden />
        {inCorso ? stato.testo : "Carica e pubblica"}
      </Button>

      <div aria-live="polite">
        {stato.fase === "errore" && <p className="text-sm text-destructive">{stato.testo}</p>}
        {stato.fase === "completato" && (
          <p className="flex items-center gap-2 text-sm text-foreground">
            <CircleCheckIcon className="size-4 text-primary" aria-hidden />
            «{stato.nomeFile}» è ora la guida attiva.
          </p>
        )}
      </div>
    </div>
  );
}
