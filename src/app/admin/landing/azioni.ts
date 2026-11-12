"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { richiediAdmin } from "@/lib/auth/admin";
import { BUCKET_LANDING } from "@/lib/bucket";
import { isBloccoValido, NOMI_BLOCCHI, type TipoBlocco } from "@/lib/landing/blocchi";
import { TAG_LANDING } from "@/lib/landing/dati";
import { BLOCCHI_NUOVI, nuovoIdBlocco, slugDaTitolo } from "@/lib/landing/editor";
import { isDominioAttivo } from "@/lib/landing/domini";
import { isSlugValido } from "@/lib/landing/slug";
import { creaClientAdmin } from "@/lib/supabase/admin";
import { creaClientServer } from "@/lib/supabase/server";

export type EsitoAzione = { errore?: string };

const isUuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/** Aggiorna subito le pagine pubbliche (cache) e il back office. */
const aggiornaPagine = (id?: string) => {
  updateTag(TAG_LANDING);
  revalidatePath("/admin/landing");
  if (id) revalidatePath("/admin/landing/modifica");
};

/** Codice Postgres per violazione di unicità (slug già usato). */
const SLUG_DUPLICATO = "23505";

// -------------------------------------------------------------
// Pubblicazione e pagina iniziale
// -------------------------------------------------------------

/**
 * Pubblica o ritira una landing. Ritirando la landing della pagina iniziale,
 * la pagina iniziale torna quella predefinita.
 */
export async function impostaPubblicazione(id: string, pubblicata: boolean): Promise<EsitoAzione> {
  const admin = await richiediAdmin();
  if (!isUuid(id)) return { errore: "Landing non valida." };

  // La RLS consente le modifiche solo agli admin.
  const supabase = await creaClientServer();
  const { data, error } = await supabase
    .from("landing_pages")
    .update(
      pubblicata
        ? { status: "pubblicata", published_at: new Date().toISOString(), updated_by: admin.id }
        : { status: "bozza", is_home: false, updated_by: admin.id },
    )
    .eq("id", id)
    .select("id");

  if (error || !data?.length) {
    console.error("Pubblicazione landing non riuscita", error);
    return { errore: "Operazione non riuscita. Riprova." };
  }
  aggiornaPagine(id);
  return {};
}

/** Usa la landing come pagina iniziale (o, con `null`, torna a quella predefinita). */
export async function impostaPaginaIniziale(id: string | null): Promise<EsitoAzione> {
  await richiediAdmin();
  if (id !== null && !isUuid(id)) return { errore: "Landing non valida." };

  const supabase = await creaClientServer();
  const { error } = await supabase.rpc("imposta_landing_iniziale", { landing_id: id });

  if (error) {
    console.error("Scelta pagina iniziale non riuscita", error);
    return {
      errore: "Operazione non riuscita: la landing deve essere pubblicata. Riprova.",
    };
  }
  aggiornaPagine(id ?? undefined);
  return {};
}

// -------------------------------------------------------------
// Creazione, duplicazione, eliminazione
// -------------------------------------------------------------

export type StatoNuovaLanding = {
  errori: { titolo?: string; slug?: string };
  valori: { titolo: string; slug: string };
  errore?: string;
};

/** Crea una landing in bozza (con apertura e prezzo già pronti) e apre l'editor. */
export async function creaLanding(
  _stato: StatoNuovaLanding,
  formData: FormData,
): Promise<StatoNuovaLanding> {
  const admin = await richiediAdmin();
  const titolo = String(formData.get("titolo") ?? "").trim().replace(/\s+/g, " ");
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase() || slugDaTitolo(titolo);
  const valori = { titolo, slug };

  const errori: StatoNuovaLanding["errori"] = {};
  if (titolo.length < 2 || titolo.length > 120) errori.titolo = "Inserisci un nome tra 2 e 120 caratteri.";
  if (!isSlugValido(slug)) {
    errori.slug = "Usa solo lettere minuscole, numeri e trattini (es. guida-vendere-casa).";
  }
  if (Object.keys(errori).length) return { errori, valori };

  const blocchi = (["hero", "prezzo"] as TipoBlocco[]).map((tipo) => ({
    id: nuovoIdBlocco(tipo),
    tipo,
    ...BLOCCHI_NUOVI[tipo],
  }));

  const supabase = await creaClientServer();
  const { data, error } = await supabase
    .from("landing_pages")
    .insert({ title: titolo, slug, blocks: blocchi, updated_by: admin.id })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === SLUG_DUPLICATO) {
      return { errori: { slug: "Questo indirizzo è già usato da un'altra landing." }, valori };
    }
    console.error("Creazione landing non riuscita", error);
    return { errori: {}, valori, errore: "Creazione non riuscita. Riprova." };
  }

  aggiornaPagine();
  redirect(`/admin/landing/modifica?id=${data.id}`);
}

/** Copia una landing come nuova bozza, con indirizzo "<slug>-copia". */
export async function duplicaLanding(id: string): Promise<EsitoAzione> {
  const admin = await richiediAdmin();
  if (!isUuid(id)) return { errore: "Landing non valida." };

  const supabase = await creaClientServer();
  const { data: originale } = await supabase
    .from("landing_pages")
    .select("slug, title, seo_title, seo_description, og_image_url, domain, blocks")
    .eq("id", id)
    .maybeSingle();
  if (!originale) return { errore: "Landing non trovata." };

  // Primo indirizzo libero: -copia, -copia-2, -copia-3…
  const base = `${originale.slug.slice(0, 70)}-copia`;
  for (let n = 1; n <= 20; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const { error } = await supabase.from("landing_pages").insert({
      slug,
      title: `${originale.title} (copia)`.slice(0, 120),
      seo_title: originale.seo_title,
      domain: originale.domain,
      seo_description: originale.seo_description,
      og_image_url: originale.og_image_url,
      blocks: originale.blocks,
      updated_by: admin.id,
    });
    if (!error) {
      aggiornaPagine();
      return {};
    }
    if (error.code !== SLUG_DUPLICATO) {
      console.error("Duplicazione landing non riuscita", error);
      break;
    }
  }
  return { errore: "Duplicazione non riuscita. Riprova." };
}

/** Elimina una landing (e le sue statistiche). Le immagini caricate restano nel bucket. */
export async function eliminaLanding(id: string): Promise<EsitoAzione> {
  await richiediAdmin();
  if (!isUuid(id)) return { errore: "Landing non valida." };

  const supabase = await creaClientServer();
  const { data, error } = await supabase.from("landing_pages").delete().eq("id", id).select("id");
  if (error || !data?.length) {
    console.error("Eliminazione landing non riuscita", error);
    return { errore: "Eliminazione non riuscita. Riprova." };
  }
  aggiornaPagine();
  return {};
}

// -------------------------------------------------------------
// Salvataggio dall'editor
// -------------------------------------------------------------

export type DatiLanding = {
  titolo: string;
  slug: string;
  seoTitolo: string;
  seoDescrizione: string;
  immagineAnteprima: string;
  dominio: string;
  blocchi: unknown[];
};

export type EsitoSalvataggio = {
  errore?: string;
  errori?: Partial<
    Record<"titolo" | "slug" | "dominio" | "seoTitolo" | "seoDescrizione" | "immagineAnteprima", string>
  >;
  /** Posizioni (da 0) dei blocchi incompleti: salvati, ma nascosti nella pagina. */
  incompleti?: number[];
};

const MAX_BLOCCHI = 60;
const MAX_DIMENSIONE_JSON = 300_000;

export async function salvaLanding(id: string, dati: DatiLanding): Promise<EsitoSalvataggio> {
  const admin = await richiediAdmin();
  if (!isUuid(id)) return { errore: "Landing non valida." };

  const pulisci = (v: unknown) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "");
  const titolo = pulisci(dati.titolo);
  const slug = pulisci(dati.slug).toLowerCase();
  const seoTitolo = pulisci(dati.seoTitolo);
  const seoDescrizione = pulisci(dati.seoDescrizione);
  const immagineAnteprima = pulisci(dati.immagineAnteprima);

  const errori: NonNullable<EsitoSalvataggio["errori"]> = {};
  if (titolo.length < 2 || titolo.length > 120) errori.titolo = "Inserisci un nome tra 2 e 120 caratteri.";
  if (!isSlugValido(slug)) errori.slug = "Usa solo lettere minuscole, numeri e trattini.";
  // Per ora si pubblica solo sul dominio dell'app.
  if (!isDominioAttivo(dati.dominio)) errori.dominio = "Questo dominio non è ancora disponibile.";
  if (seoTitolo.length > 120) errori.seoTitolo = "Massimo 120 caratteri (meglio sotto i 60).";
  if (seoDescrizione.length > 300) errori.seoDescrizione = "Massimo 300 caratteri (meglio sotto i 160).";
  if (immagineAnteprima && !immagineAnteprima.startsWith("https://")) {
    errori.immagineAnteprima = "Serve un indirizzo https.";
  }

  // Blocchi: solo tipi conosciuti, ognuno con un id; il contenuto resta com'è.
  if (!Array.isArray(dati.blocchi) || dati.blocchi.length > MAX_BLOCCHI) {
    return { errore: `Una landing può avere al massimo ${MAX_BLOCCHI} blocchi.` };
  }
  const blocchi = dati.blocchi.flatMap((b) => {
    if (typeof b !== "object" || b === null || Array.isArray(b)) return [];
    const tipo = (b as { tipo?: unknown }).tipo;
    if (typeof tipo !== "string" || !(tipo in NOMI_BLOCCHI)) return [];
    const idBlocco = (b as { id?: unknown }).id;
    return [{ ...b, id: typeof idBlocco === "string" && idBlocco ? idBlocco : nuovoIdBlocco(tipo as TipoBlocco) }];
  });
  if (JSON.stringify(blocchi).length > MAX_DIMENSIONE_JSON) {
    return { errore: "La landing è troppo grande: riduci testi o immagini." };
  }
  if (Object.keys(errori).length) return { errori };

  const supabase = await creaClientServer();
  const { data, error } = await supabase
    .from("landing_pages")
    .update({
      title: titolo,
      slug,
      seo_title: seoTitolo || null,
      seo_description: seoDescrizione || null,
      og_image_url: immagineAnteprima || null,
      domain: isDominioAttivo(dati.dominio) ? dati.dominio : "app",
      blocks: blocchi,
      updated_by: admin.id,
    })
    .eq("id", id)
    .select("id");

  if (error || !data?.length) {
    if (error?.code === SLUG_DUPLICATO) {
      return { errori: { slug: "Questo indirizzo è già usato da un'altra landing." } };
    }
    console.error("Salvataggio landing non riuscito", error);
    return { errore: "Salvataggio non riuscito. Riprova." };
  }

  aggiornaPagine(id);
  const incompleti = blocchi.flatMap((b, i) => (isBloccoValido(b) ? [] : [i]));
  return { incompleti };
}

// -------------------------------------------------------------
// Immagini: caricamento diretto dal browser con URL firmato
// -------------------------------------------------------------

const TIPI_IMMAGINE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};
const DIMENSIONE_MAX_IMMAGINE = 10 * 1024 * 1024;

export type EsitoPreparazioneImmagine =
  | { percorso: string; token: string; url: string; errore?: never }
  | { errore: string };

/** Crea l'URL firmato per caricare un'immagine nel bucket pubblico delle landing. */
export async function preparaCaricamentoImmagine(file: {
  tipo: string;
  dimensione: number;
}): Promise<EsitoPreparazioneImmagine> {
  await richiediAdmin();
  const estensione = TIPI_IMMAGINE[file.tipo];
  if (!estensione) return { errore: "Formato non supportato: usa JPG, PNG, WebP, AVIF o GIF." };
  if (!(file.dimensione > 0) || file.dimensione > DIMENSIONE_MAX_IMMAGINE) {
    return { errore: "L'immagine deve pesare al massimo 10 MB." };
  }

  const casuale = Math.random().toString(36).slice(2, 10);
  const percorso = `immagini/${Date.now()}-${casuale}.${estensione}`;
  const storage = creaClientAdmin().storage.from(BUCKET_LANDING);
  const { data, error } = await storage.createSignedUploadUrl(percorso);
  if (error || !data) {
    console.error("URL di caricamento immagine non creato", error);
    return { errore: "Non è stato possibile avviare il caricamento. Riprova." };
  }
  return {
    percorso: data.path,
    token: data.token,
    url: storage.getPublicUrl(data.path).data.publicUrl,
  };
}
