import {
  CalculatorIcon,
  ClockIcon,
  FileCheckIcon,
  HomeIcon,
  ListChecksIcon,
  MessagesSquareIcon,
  ShieldCheckIcon,
  TagIcon,
  type LucideIcon,
} from "lucide-react";

import type { IconaPunto } from "@/lib/landing/blocchi";

/** Icone dei punti chiave, scelte per nome nel JSON della landing. */
export const iconePunti: Record<IconaPunto, LucideIcon> = {
  sicurezza: ShieldCheckIcon,
  metodo: ListChecksIcon,
  valore: TagIcon,
  costi: CalculatorIcon,
  documenti: FileCheckIcon,
  tempo: ClockIcon,
  casa: HomeIcon,
  dialogo: MessagesSquareIcon,
};
