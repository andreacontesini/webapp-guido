import {
  BellIcon,
  BookOpenIcon,
  FileTextIcon,
  HomeIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
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
  },
];

export const navigazioneAdmin: VoceNavigazione[] = [
  { titolo: "Panoramica", href: "/admin", icona: LayoutDashboardIcon },
  {
    titolo: "Utenti",
    href: "/admin/utenti",
    icona: UsersIcon,
  },
  {
    titolo: "Guida PDF",
    href: "/admin/guida",
    icona: FileTextIcon,
  },
  {
    titolo: "Landing",
    href: "/admin/landing",
    icona: MegaphoneIcon,
  },
  {
    titolo: "Notifiche",
    href: "/admin/notifiche",
    icona: BellIcon,
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
  cliente: {
    voci: navigazioneCliente,
    radice: "/dashboard",
    nome: "La tua area",
    etichettaNav: "Navigazione principale",
  },
  admin: {
    voci: navigazioneAdmin,
    radice: "/admin",
    nome: "Amministrazione",
    etichettaNav: "Navigazione amministrazione",
  },
} as const;

export type Area = keyof typeof aree;
