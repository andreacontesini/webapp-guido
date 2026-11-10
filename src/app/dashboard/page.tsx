import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "La tua area",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Benvenuto</h1>
        <p className="text-muted-foreground">
          Qui trovi tutti i materiali per vendere casa da privato.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>La tua guida</CardTitle>
            <CardDescription>
              La guida PDF passo passo, consultabile direttamente nell&apos;app.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Il tuo videocorso</CardTitle>
              <Badge variant="secondary">Presto disponibile</Badge>
            </div>
            <CardDescription>
              Le lezioni video per affrontare ogni fase della vendita.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
