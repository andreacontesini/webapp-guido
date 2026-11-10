# Istruzioni Operative per Claude Code

## Contesto di Progetto
- **Progetto:** Web App "Vendere Casa da Privato"
- **Stack:** Next.js (App Router, TS), Tailwind CSS, shadcn/ui, Supabase, Stripe, Bunny.net, Resend.
- **Lingua interfaccia e codice:** Esclusivamente italiano.
- **Riferimento task:** Seguire rigorosamente l'ordine del file `TODO.md`.

## Regole di Sviluppo & Git
1. **Commit Frequenti:** A ogni singolo sotto-task completato e testato, esegui un commit con convenzione semantica (es. `feat: ...`, `fix: ...`, `chore: ...`).
2. **Aggiornamento TODO:** Spunta sempre la casella corrispondente in `TODO.md` prima del commit.

## Regola Automatica di Versionamento (IMPORTANTE)
- **Ogni volta che completi un'intera Macro-Fase** (o un blocco logico significativo):
  1. Fermati prima di passare alla fase successiva.
  2. Aggiorna la versione nel `package.json` (es. da `0.1.0` a `0.2.0`).
  3. Fai questa domanda esatta all'utente:
     > *"Abbiamo completato la [Nome Fase]. Vuoi che crei il tag Git `vX.Y.Z` e proceda con il push della versione su GitHub?"*
  4. Attendi la conferma dell'utente:
     - Se l'utente conferma: esegui `git tag -a vX.Y.Z -m "Rilascio vX.Y.Z - [Descrizione]"`, fai `git push origin --tags` e procedi.
     - Se l'utente rifiuta: prosegui semplicemente con i task successivi.