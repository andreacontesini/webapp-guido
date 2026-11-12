import type { ComponentProps } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "cn";

/** Select nativa (ottima su smartphone) con freccia allineata allo stile dei campi. */
export function SelectNativa({ className, ...props }: ComponentProps<"select">) {
  return (
    <div className={cn("relative", className)}>
      <select
        className="h-12 w-full appearance-none rounded-lg border border-input bg-transparent pr-10 pl-3.5 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 [&>option]:bg-popover"
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
