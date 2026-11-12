import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EyeIcon, PencilIcon } from "lucide-react";

import { PaginaLanding } from "@/components/landing/pagina-landing";
import { richiediAdmin } from "@/lib/auth/admin";
import { converti } from "@/lib/landing/dati";
import { creaClientServer } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Anteprima landing",
  robots: { index: false, follow: false },
};

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/**
 * Anteprima di una landing (anche in bozza), riservata agli admin.
 * Mostra l'ultima versione salvata, come la vedranno i visitatori, senza
 * contare visite né checkout.
 */
export default function AnteprimaLanding({ params }: PageProps<"/anteprima/[id]">) {
  return (
    <Suspense fallback={<p className="p-6 text-muted-foreground">Caricamento anteprima…</p>}>
      <Anteprima params={params} />
    </Suspense>
  );
}

async function Anteprima({ params }: Pick<PageProps<"/anteprima/[id]">, "params">) {
  await richiediAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await creaClientServer();
  const { data } = await supabase
    .from("landing_pages")
    .select("id, slug, title, seo_title, seo_description, og_image_url, blocks, is_home, updated_at, status")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-black">
        <span className="inline-flex items-center gap-1.5">
          <EyeIcon className="size-4" aria-hidden />
          Anteprima {data.status === "bozza" ? "della bozza" : "della landing pubblicata"} · ultima
          versione salvata
        </span>
        <Link href={`/admin/landing/modifica?id=${data.id}`} className="inline-flex items-center gap-1 underline">
          <PencilIcon className="size-3.5" aria-hidden />
          Torna all&apos;editor
        </Link>
      </div>
      <PaginaLanding landing={converti(data)} anteprima />
    </>
  );
}
