import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeftIcon } from "lucide-react";

import { AzioniLanding } from "@/app/admin/landing/azioni-landing";
import { EditorLanding } from "@/app/admin/landing/modifica/editor-landing";
import { Badge } from "@/components/ui/badge";
import { richiediAdmin } from "@/lib/auth/admin";
import { creaClientServer } from "@/lib/supabase/server";
import { urlLanding } from "@/lib/url";

export const metadata: Metadata = {
  title: "Modifica landing",
};

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/** Editor di una landing: /admin/landing/modifica?id=<id>. */
export default function PaginaEditorLanding({ searchParams }: PageProps<"/admin/landing/modifica">) {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/landing"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" aria-hidden />
        Tutte le landing
      </Link>
      <Suspense fallback={<p className="text-muted-foreground">Caricamento landing…</p>}>
        <Editor searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Editor({
  searchParams,
}: Pick<PageProps<"/admin/landing/modifica">, "searchParams">) {
  await richiediAdmin();
  const { id } = await searchParams;
  if (typeof id !== "string" || !isUuid(id)) notFound();

  // La RLS consente agli admin di leggere anche le bozze.
  const supabase = await creaClientServer();
  const { data: landing } = await supabase
    .from("landing_pages")
    .select("id, slug, title, seo_title, seo_description, og_image_url, domain, blocks, status, is_home")
    .eq("id", id)
    .maybeSingle();
  if (!landing) notFound();

  const pubblicata = landing.status === "pubblicata";
  const blocchi = Array.isArray(landing.blocks)
    ? landing.blocks.filter(
        (b): b is Record<string, unknown> => typeof b === "object" && b !== null && !Array.isArray(b),
      )
    : [];

  return (
    <>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{landing.title}</h1>
            <Badge variant={pubblicata ? "default" : "secondary"}>
              {pubblicata ? "Pubblicata" : "Bozza"}
            </Badge>
            {landing.is_home && <Badge variant="outline">Pagina iniziale</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {pubblicata
              ? "Le modifiche salvate vanno online subito."
              : "Bozza: visibile solo in anteprima finché non la pubblichi."}
          </p>
        </div>
        <AzioniLanding id={landing.id} pubblicata={pubblicata} paginaIniziale={landing.is_home} />
      </header>

      <EditorLanding
        // Dopo un salvataggio i dati del server ripartono da capo nell'editor.
        key={JSON.stringify(landing)}
        base={urlLanding()}
        iniziale={{
          id: landing.id,
          titolo: landing.title,
          slug: landing.slug,
          dominio: landing.domain,
          seoTitolo: landing.seo_title ?? "",
          seoDescrizione: landing.seo_description ?? "",
          immagineAnteprima: landing.og_image_url ?? "",
          blocchi,
          pubblicata,
        }}
      />
    </>
  );
}
