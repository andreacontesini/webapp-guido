/** Percorsi usati dal flusso di autenticazione. */
export const PERCORSO_ACCESSO = "/accesso";
export const PERCORSO_BENVENUTO = "/benvenuto";
export const PERCORSO_ESCI = "/auth/esci";
export const PERCORSO_CONFERMA = "/auth/conferma";
export const PERCORSO_INIZIALE = "/dashboard";
export const PERCORSO_ADMIN = "/admin";
/** Anteprima delle landing in bozza: fuori da /admin per mostrarle a pagina intera. */
export const PERCORSO_ANTEPRIMA = "/anteprima";

/** Aree riservate: serve una sessione valida. */
const PREFISSI_PROTETTI = ["/dashboard", PERCORSO_ADMIN, PERCORSO_ANTEPRIMA, PERCORSO_BENVENUTO];

const sottoPercorso = (pathname: string, prefisso: string) =>
  pathname === prefisso || pathname.startsWith(`${prefisso}/`);

export function isPercorsoProtetto(pathname: string) {
  return PREFISSI_PROTETTI.some((p) => sottoPercorso(pathname, p));
}

/** Back office (e anteprime): oltre alla sessione serve `role: admin`. */
export function isPercorsoAdmin(pathname: string) {
  return sottoPercorso(pathname, PERCORSO_ADMIN) || sottoPercorso(pathname, PERCORSO_ANTEPRIMA);
}

/** Motivi per cui un utente viene fatto uscire, mostrati nella pagina di accesso. */
export const motiviUscita = {
  "altra-sessione":
    "Hai effettuato l'accesso da un altro dispositivo, quindi qui la sessione è stata chiusa.",
  bloccato:
    "Il tuo account è sospeso. Scrivici se pensi che si tratti di un errore.",
  "link-non-valido":
    "Il link di accesso non è valido o è scaduto. Richiedine uno nuovo.",
  errore: "Si è verificato un problema con il tuo account. Riprova ad accedere.",
} as const;

export type MotivoUscita = keyof typeof motiviUscita;

export function isMotivoUscita(valore: unknown): valore is MotivoUscita {
  return typeof valore === "string" && valore in motiviUscita;
}

/** Accetta solo percorsi interni ("/..."), per evitare redirect verso altri siti. */
export function percorsoSicuro(valore: string | null | undefined) {
  if (!valore || !valore.startsWith("/") || valore.startsWith("//") || valore.startsWith("/\\")) {
    return PERCORSO_INIZIALE;
  }
  return valore;
}
