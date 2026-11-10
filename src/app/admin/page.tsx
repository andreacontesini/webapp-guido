import type { Metadata } from "next";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Panoramica",
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Panoramica</h1>
        <p className="text-muted-foreground">
          Gestisci utenti, permessi e contenuti dell&apos;app.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Utenti</CardTitle>
            <CardDescription>
              Elenco utenti, blocchi e permessi. Disponibile nella Fase 4.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Guida PDF</CardTitle>
            <CardDescription>
              Caricamento e aggiornamento della guida. Disponibile nella Fase 4.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
