"use client";

import { Toaster } from "sonner";

/**
 * Notifiche a comparsa (sonner) con i colori dell'app: seguono il tema
 * chiaro/scuro tramite le variabili CSS. Si mostrano con `toast` di "sonner".
 */
export function Notifiche() {
  return (
    <Toaster
      position="bottom-center"
      closeButton
      toastOptions={{
        classNames: {
          toast: "!bg-popover !text-popover-foreground !border !border-border !rounded-lg !shadow-lg !font-sans",
          description: "!text-muted-foreground",
          error: "!border-destructive/50",
          closeButton: "!bg-popover !text-muted-foreground !border-border",
        },
      }}
    />
  );
}
