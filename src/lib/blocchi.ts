/**
 * Divide un elenco in blocchi di al più `dimensione` elementi. Serve per i
 * filtri `in(...)` di Supabase: con centinaia di id l'URL della richiesta
 * supererebbe i limiti di lunghezza.
 */
export function aBlocchi<T>(elenco: T[], dimensione: number): T[][] {
  const blocchi: T[][] = [];
  for (let i = 0; i < elenco.length; i += dimensione) blocchi.push(elenco.slice(i, i + dimensione));
  return blocchi;
}
