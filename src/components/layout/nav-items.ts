import {
  BookOpenIcon,
  FileTextIcon,
  HomeIcon,
  LayoutDashboardIcon,
  PlayCircleIcon,
  UserIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

export type VoceNavigazione = {
  titolo: string;
  href: string;
  icona: LucideIcon;
  /** Voce visibile ma non ancora attiva (sezione in sviluppo). */
  disabilitata?: boolean;
};

export const navigazioneCliente: VoceNavigazione[] = [
  { titolo: "Home", href: "/dashboard", icona: HomeIcon },
  {
    titolo: "Guida",
    href: "/dashboard/guida",
    icona: BookOpenIcon,
    disabilitata: true,
  },
  {
    titolo: "Videocorso",
    href: "/dashboard/videocorso",
    icona: PlayCircleIcon,
    disabilitata: true,
  },
  {
    titolo: "Profilo",
    href: "/dashboard/profilo",
    icona: UserIcon,
    disabilitata: true,
  },
];

export const navigazioneAdmin: VoceNavigazione[] = [
  { titolo: "Panoramica", href: "/admin", icona: LayoutDashboardIcon },
  {
    titolo: "Utenti",
    href: "/admin/utenti",
    icona: UsersIcon,
    disabilitata: true,
  },
  {
    titolo: "Guida PDF",
    href: "/admin/guida",
    icona: FileTextIcon,
    disabilitata: true,
  },
];

/** Una voce è attiva se coincide con il percorso o ne è un antenato (esclusa la radice dell'area). */
export function isVoceAttiva(pathname: string, href: string, radice: string) {
  if (href === radice) return pathname === radice;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Aree dell'app con la propria navigazione. Si passa la chiave (stringa) ai
 *  componenti client, perché le icone sono funzioni e non possono attraversare
 *  il confine server → client. */
export const aree = {
  cliente: { voci: navigazioneCliente, radice: "/dashboard" },
  admin: { voci: navigazioneAdmin, radice: "/admin" },
} as const;

export type Area = keyof typeof aree;
