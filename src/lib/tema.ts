export type PreferenzaTema = "sistema" | "chiaro" | "scuro";

export const CHIAVE_TEMA = "tema";
export const EVENTO_TEMA = "cambio-tema";

/**
 * Script eseguito nel <head> prima del primo disegno della pagina:
 * applica la classe `dark` in base alla preferenza salvata (o al sistema),
 * così non c'è il lampo di tema sbagliato al caricamento.
 */
export const scriptTemaIniziale = `(function(){try{var p=localStorage.getItem("${CHIAVE_TEMA}")||"sistema";var d=p==="scuro"||(p==="sistema"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export function leggiPreferenza(): PreferenzaTema {
  try {
    const valore = localStorage.getItem(CHIAVE_TEMA);
    if (valore === "chiaro" || valore === "scuro") return valore;
  } catch {
    // localStorage non disponibile (es. navigazione privata restrittiva)
  }
  return "sistema";
}

export function applicaTema(preferenza: PreferenzaTema) {
  const scuro =
    preferenza === "scuro" ||
    (preferenza === "sistema" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  const radice = document.documentElement;
  radice.classList.toggle("dark", scuro);
  radice.style.colorScheme = scuro ? "dark" : "light";
}

export function salvaPreferenza(preferenza: PreferenzaTema) {
  try {
    if (preferenza === "sistema") localStorage.removeItem(CHIAVE_TEMA);
    else localStorage.setItem(CHIAVE_TEMA, preferenza);
  } catch {
    // Se non si può salvare, il tema vale comunque per la sessione corrente.
  }
  applicaTema(preferenza);
  window.dispatchEvent(new Event(EVENTO_TEMA));
}
