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
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
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
  created_at: string;
  updated_at: string;
}

export type KajianFormData = Omit<Kajian, 'id' | 'created_at' | 'updated_at'>;

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
  created_at: string;
  updated_at: string;
}

export type EventFormData = Omit<MosqueEvent, 'id' | 'created_at' | 'updated_at'>;

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
