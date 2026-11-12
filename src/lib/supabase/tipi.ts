/**
 * Tipi del database Supabase (schema `public`).
 * Allineati alle migrazioni in `supabase/migrations/`: se cambi lo schema,
 * aggiorna anche questo file (oppure rigeneralo con `supabase gen types`).
 */

export type RuoloUtente = "cliente" | "admin";

export type Profilo = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: RuoloUtente;
  is_blocked: boolean;
  guide_access: boolean;
  privacy_accepted_at: string | null;
  marketing_consent: boolean;
  onboarded_at: string | null;
  current_session_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ImpostazioniGuida = {
  id: number;
  title: string;
  description: string | null;
  file_path: string | null;
  version: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type StatoAcquisto = "in_attesa" | "pagato" | "rimborsato" | "contestato";

/** Acquisto tramite Stripe Checkout: scritto solo dal webhook (service role). */
export type Acquisto = {
  id: string;
  user_id: string | null;
  email: string;
  product: "guida" | "videocorso";
  status: StatoAcquisto;
  /** Importo in centesimi. */
  amount_total: number | null;
  currency: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StatoLanding = "bozza" | "pubblicata";

/** Landing di vendita: `blocks` ha il formato di `src/lib/landing/blocchi.ts`. */
export type LandingPage = {
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  blocks: unknown;
  status: StatoLanding;
  is_home: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
};

export type TipoEventoLanding = "visita" | "checkout" | "acquisto";

/** Evento anonimo di conversione di una landing (scritto solo dal server). */
export type EventoLanding = {
  id: number;
  landing_id: string;
  type: TipoEventoLanding;
  created_at: string;
};

/** Campi del profilo che l'utente può modificare (vedi grant nella migrazione RLS). */
type ProfiloModificabile = Partial<
  Pick<
    Profilo,
    | "first_name"
    | "last_name"
    | "phone"
    | "privacy_accepted_at"
    | "marketing_consent"
    | "onboarded_at"
  >
>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profilo;
        Insert: Pick<Profilo, "id" | "email"> & Partial<Profilo>;
        Update: ProfiloModificabile & Partial<Profilo>;
        Relationships: [];
      };
      guide_settings: {
        Row: ImpostazioniGuida;
        Insert: Partial<ImpostazioniGuida>;
        Update: Partial<ImpostazioniGuida>;
        Relationships: [];
      };
      purchases: {
        Row: Acquisto;
        Insert: Pick<Acquisto, "email" | "product"> & Partial<Acquisto>;
        Update: Partial<Acquisto>;
        Relationships: [];
      };
      landing_pages: {
        Row: LandingPage;
        Insert: Pick<LandingPage, "slug" | "title"> & Partial<LandingPage>;
        Update: Partial<LandingPage>;
        Relationships: [];
      };
      landing_events: {
        Row: EventoLanding;
        Insert: Pick<EventoLanding, "landing_id" | "type"> & Partial<EventoLanding>;
        Update: Partial<EventoLanding>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      registra_sessione_corrente: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      imposta_landing_iniziale: {
        Args: { landing_id: string | null };
        Returns: undefined;
      };
      statistiche_landing: {
        Args: { giorni?: number };
        Returns: { landing_id: string; visite: number; checkout: number; acquisti: number }[];
      };
    };
    Enums: {
      ruolo_utente: RuoloUtente;
      stato_acquisto: StatoAcquisto;
      stato_landing: StatoLanding;
      tipo_evento_landing: TipoEventoLanding;
    };
    CompositeTypes: Record<string, never>;
  };
};
