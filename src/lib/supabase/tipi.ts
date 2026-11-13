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
  residence_city: string | null;
  residence_province: string | null;
  contact_preference: "telefono" | "whatsapp" | "email" | null;
  contact_time: "mattina" | "pomeriggio" | "sera" | "indifferente" | null;
  /** Richiesta di ricontatto dal profilo (Fase 9): null = nessuna richiesta. */
  contact_request_at: string | null;
  contact_request_notes: string | null;
  /** Richiesta segnata come gestita da un admin. */
  contact_request_handled_at: string | null;
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

export type CodiceDocumento =
  | "atto_provenienza"
  | "planimetria"
  | "visura"
  | "ape"
  | "agibilita"
  | "spese_condominiali";
export type RispostaDocumento = "si" | "no" | "non_so";
export type Documenti = Partial<Record<CodiceDocumento, RispostaDocumento>>;

/**
 * Immobile da vendere del cliente (tabella `properties`, uno per cliente).
 * I valori testuali sono validati da `src/lib/profilo/campi.ts` e dal database.
 */
export type Immobile = {
  id: string;
  user_id: string;
  street: string | null;
  city: string | null;
  province: string | null;
  area: string | null;
  property_type: string | null;
  usage: string | null;
  surface_sqm: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  has_elevator: boolean | null;
  year_built: number | null;
  condition: string | null;
  energy_class: string | null;
  has_garage: boolean | null;
  has_cellar: boolean | null;
  has_garden: boolean | null;
  has_terrace: boolean | null;
  heating: string | null;
  condo_fees_monthly: number | null;
  ownership: string | null;
  owners_count: number | null;
  owners_agree: string | null;
  inherited: boolean | null;
  succession_done: string | null;
  mortgage: string | null;
  occupancy: string | null;
  lease_end: string | null;
  compliance_doubts: string | null;
  compliance_notes: string | null;
  building_bonus_works: boolean | null;
  documents: Documenti;
  sale_timeline: string | null;
  sale_reason: string | null;
  linked_purchase: string | null;
  expected_price: number | null;
  valuation_done: boolean | null;
  valuation_by: string | null;
  listed_before: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type StatoLanding = "bozza" | "pubblicata";

/** Dominio di pubblicazione di una landing (per ora solo `app` è attivo). */
export type DominioLanding = "app" | "principale";

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
  domain: DominioLanding;
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

/** Destinatario delle notifiche agli admin (Fase 9). `events`: codici di `src/lib/notifiche/eventi.ts`. */
export type DestinatarioNotifiche = {
  id: string;
  email: string;
  name: string | null;
  paused: boolean;
  events: string[];
  created_at: string;
  updated_at: string;
};

export type StatoNotifica =
  | "in_invio"
  | "inviata"
  | "parziale"
  | "non_inviata"
  | "nessun_destinatario";

/** Riga dello storico delle notifiche (scritta solo dal server). */
export type RigaStoricoNotifiche = {
  id: number;
  event: string;
  dedupe_key: string | null;
  subject: string;
  user_id: string | null;
  customer_email: string | null;
  data: unknown;
  recipients: string[];
  status: StatoNotifica;
  error: string | null;
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
    | "contact_request_at"
    | "contact_request_notes"
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
      properties: {
        Row: Immobile;
        Insert: Partial<Omit<Immobile, "id" | "created_at" | "updated_at">> & { user_id: string };
        Update: Partial<Omit<Immobile, "id" | "user_id" | "created_at" | "updated_at">>;
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
      admin_notification_recipients: {
        Row: DestinatarioNotifiche;
        Insert: Pick<DestinatarioNotifiche, "email"> & Partial<DestinatarioNotifiche>;
        Update: Partial<Omit<DestinatarioNotifiche, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      admin_notification_log: {
        Row: RigaStoricoNotifiche;
        Insert: Pick<RigaStoricoNotifiche, "event" | "subject"> & Partial<Omit<RigaStoricoNotifiche, "id">>;
        Update: Partial<Omit<RigaStoricoNotifiche, "id">>;
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
      dominio_landing: DominioLanding;
      tipo_evento_landing: TipoEventoLanding;
    };
    CompositeTypes: Record<string, never>;
  };
};
