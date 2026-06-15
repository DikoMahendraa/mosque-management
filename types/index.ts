// ============================================================
// COMMON TYPES
// ============================================================

export type Status = 'active' | 'inactive' | 'draft' | 'published' | 'upcoming' | 'finished';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

// ============================================================
// AUTH TYPES
// ============================================================

export interface User {
  id: string;
  name?: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  user_metadata?: {
    name?: string;
    role?: 'admin' | 'editor' | 'viewer';
    [key: string]: unknown;
  };
}

// ============================================================
// LANDING PAGE TYPES
// ============================================================

export interface HeroSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  button_text: string;
  button_link: string;
  updated_at: string;
}

export interface AboutSection {
  id: string;
  title: string;
  description: string;
  image: string;
  updated_at: string;
}

export interface VisionMission {
  id: string;
  vision: string;
  missions: string[];
  updated_at: string;
}

export interface FeaturedProgram {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface ContactInfo {
  id: string;
  address: string;
  phone: string;
  email: string;
  maps_embed: string;
  social_instagram: string;
  social_youtube: string;
  social_facebook: string;
  updated_at: string;
}

// ============================================================
// KAJIAN TYPES
// ============================================================

export interface Kajian {
  id: string;
  title: string;
  speaker: string;
  description: string;
  date: string;
  time: string;
  location: string;
  poster_image: string;
  status: 'upcoming' | 'finished';
  is_archived?: boolean;
  registration_count?: number;
  donation_campaign?: KajianDonationCampaign | null;
  created_at: string;
  updated_at: string;
}

export interface KajianDonationCampaign {
  id: string;
  kajian_id: string;
  target_amount: number;
  collected_amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'closed';
}

export interface KajianDonationInput {
  enabled: boolean;
  target_amount: number;
  start_date: string;
  end_date: string;
}

export type KajianFormData = Omit<
  Kajian,
  'id' | 'created_at' | 'updated_at' | 'registration_count' | 'donation_campaign' | 'is_archived'
>;

export interface KajianRegistration {
  id: string;
  kajian_id: string;
  name: string;
  address: string;
  age: number;
  phone: string | null;
  created_at: string;
}

// ============================================================
// EVENT TYPES
// ============================================================

export interface MosqueEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  poster: string;
  status: 'upcoming' | 'finished';
  is_archived?: boolean;
  registration_count?: number;
  created_at: string;
  updated_at: string;
}

export type EventFormData = Omit<
  MosqueEvent,
  'id' | 'created_at' | 'updated_at' | 'registration_count' | 'is_archived'
>;

export interface EventRegistration {
  id: string;
  event_id: string;
  name: string;
  address: string;
  age: number;
  phone: string | null;
  created_at: string;
}

// ============================================================
// TAHSIN TYPES
// ============================================================

export interface TahsinClass {
  id: string;
  class_name: string;
  teacher: string;
  schedule: string;
  description: string;
  capacity: number;
  location: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export type TahsinFormData = Omit<TahsinClass, 'id' | 'created_at' | 'updated_at'>;

// ============================================================
// BERBAGI TYPES
// ============================================================

export interface BerbagiProgram {
  id: string;
  program_name: string;
  description: string;
  target_amount: number;
  collected_amount: number;
  program_date: string;
  status: 'active' | 'completed' | 'upcoming';
  created_at: string;
  updated_at: string;
}

export type BerbagiFormData = Omit<BerbagiProgram, 'id' | 'created_at' | 'updated_at'>;

// ============================================================
// GALLERY TYPES
// ============================================================

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export type GalleryFormData = Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>;

// ============================================================
// POST TYPES
// ============================================================

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string;
  author: string;
  published_date: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export type PostFormData = Omit<Post, 'id' | 'created_at' | 'updated_at'>;

// ============================================================
// FINANCE TYPES
// ============================================================

export type TransactionType = 'income' | 'expense';

export interface FinanceTransaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  type: TransactionType;
  created_at: string;
  updated_at: string;
}

export type FinanceFormData = Omit<FinanceTransaction, 'id' | 'created_at' | 'updated_at'>;

export interface FinanceSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  monthly_data: MonthlyFinanceData[];
}

export interface MonthlyFinanceData {
  month: string;
  income: number;
  expense: number;
}

// ============================================================
// MANAGEMENT TYPES
// ============================================================

export interface MosqueAdmin {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  photo: string;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export type AdminFormData = Omit<MosqueAdmin, 'id' | 'created_at' | 'updated_at'>;

// ============================================================
// PRAYER SCHEDULE TYPES
// ============================================================

export interface PrayerSchedule {
  id: string;
  date: string;
  fajr_imam: string;
  dhuhr_imam: string;
  asr_imam: string;
  maghrib_imam: string;
  isha_imam: string;
  fajr_muadzin: string;
  dhuhr_muadzin: string;
  asr_muadzin: string;
  maghrib_muadzin: string;
  isha_muadzin: string;
  created_at: string;
  updated_at: string;
}

export type PrayerFormData = Omit<PrayerSchedule, 'id' | 'created_at' | 'updated_at'>;

// ============================================================
// FRIDAY DUTY TYPES
// ============================================================

export interface FridayDuty {
  id: string;
  date: string;
  khateeb: string;
  imam: string;
  muadzin: string;
  bilal: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type FridayFormData = Omit<FridayDuty, 'id' | 'created_at' | 'updated_at'>;

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface DashboardStats {
  total_kajian: number;
  total_events: number;
  total_tahsin: number;
  total_posts: number;
  total_income_month: number;
  total_expense_month: number;
  balance: number;
  upcoming_events: MosqueEvent[];
  upcoming_kajian: Kajian[];
}

// ============================================================
// USTAD TYPES
// ============================================================

export interface Ustad {
  id: string;
  nama: string;
  nomor_whatsapp: string;
  alamat: string;
  created_at: string;
  updated_at: string;
}

export type UstadFormData = Omit<Ustad, 'id' | 'created_at' | 'updated_at'>;

// ============================================================
// JAMAAH TYPES
// ============================================================

export type JamaahStatus = 'jamaah_tetap' | 'musafir' | 'donatur';

export const JAMAAH_STATUS_LABELS: Record<JamaahStatus, string> = {
  jamaah_tetap: 'Jamaah Tetap',
  musafir: 'Musafir',
  donatur: 'Donatur',
};

export interface Jamaah {
  id: string;
  nama: string;
  nomor_whatsapp: string;
  alamat: string;
  status: JamaahStatus;
  created_at: string;
  updated_at: string;
}

export type JamaahFormData = Omit<Jamaah, 'id' | 'created_at' | 'updated_at'>;

// ============================================================
// APP SETTINGS TYPES
// ============================================================

export interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'boolean' | 'number' | 'json';
  description: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppSettings {
  enabled: boolean;
  provider: 'fonnte' | 'wablas' | 'twilio';
  token: string;
  device: string;
}

export type AIProvider = 'template' | 'gemini' | 'openai';

export interface AISettings {
  enabled: boolean;
  default_provider: AIProvider;
  gemini_api_key: string;
  openai_api_key: string;
  mosque_name: string;
}

export type EventPosterTemplate = 'emerald' | 'gold' | 'night';

export interface EventPosterInput {
  title: string;
  eventDate: string;
  location: string;
  description?: string;
  mosqueName?: string;
  template?: EventPosterTemplate;
  landingUrl?: string;
}

// ============================================================
// BROADCAST TYPES
// ============================================================

export interface BroadcastMessage {
  id: string;
  reference_type: 'kajian' | 'event';
  reference_id: string;
  title: string;
  message: string;
  recipient_type: 'all' | 'selected';
  status: 'draft' | 'sending' | 'completed' | 'failed';
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
}

export interface BroadcastRecipient {
  id: string;
  broadcast_id: string;
  jamaah_id: string;
  jamaah_name: string;
  jamaah_phone: string;
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
  created_at: string;
}
