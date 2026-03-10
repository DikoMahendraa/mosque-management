import {
  HeroSection,
  AboutSection,
  VisionMission,
  FeaturedProgram,
  ContactInfo,
  ApiResponse,
} from '@/types';
import {
  mockHero,
  mockAbout,
  mockVisionMission,
  mockFeaturedPrograms,
  mockContact,
} from '@/lib/mock-data';
import { generateId } from '@/lib/utils';

let heroData: HeroSection = { ...mockHero };
let aboutData: AboutSection = { ...mockAbout };
let visionData: VisionMission = { ...mockVisionMission };
let featuredData: FeaturedProgram[] = [...mockFeaturedPrograms];
let contactData: ContactInfo = { ...mockContact };

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const landingService = {
  async getHero(): Promise<ApiResponse<HeroSection>> {
    await delay();
    return { data: heroData };
  },
  async updateHero(payload: Partial<HeroSection>): Promise<ApiResponse<HeroSection>> {
    await delay();
    heroData = { ...heroData, ...payload, updated_at: new Date().toISOString() };
    return { data: heroData, message: 'Hero section berhasil diupdate' };
  },

  async getAbout(): Promise<ApiResponse<AboutSection>> {
    await delay();
    return { data: aboutData };
  },
  async updateAbout(payload: Partial<AboutSection>): Promise<ApiResponse<AboutSection>> {
    await delay();
    aboutData = { ...aboutData, ...payload, updated_at: new Date().toISOString() };
    return { data: aboutData, message: 'Tentang masjid berhasil diupdate' };
  },

  async getVisionMission(): Promise<ApiResponse<VisionMission>> {
    await delay();
    return { data: visionData };
  },
  async updateVisionMission(payload: Partial<VisionMission>): Promise<ApiResponse<VisionMission>> {
    await delay();
    visionData = { ...visionData, ...payload, updated_at: new Date().toISOString() };
    return { data: visionData, message: 'Visi & Misi berhasil diupdate' };
  },

  async getFeaturedPrograms(): Promise<ApiResponse<FeaturedProgram[]>> {
    await delay();
    return { data: featuredData };
  },
  async createFeaturedProgram(payload: Omit<FeaturedProgram, 'id'>): Promise<ApiResponse<FeaturedProgram>> {
    await delay();
    const newItem: FeaturedProgram = { ...payload, id: generateId() };
    featuredData = [...featuredData, newItem];
    return { data: newItem, message: 'Program unggulan berhasil ditambahkan' };
  },
  async updateFeaturedProgram(id: string, payload: Partial<FeaturedProgram>): Promise<ApiResponse<FeaturedProgram>> {
    await delay();
    const index = featuredData.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Program not found');
    featuredData[index] = { ...featuredData[index], ...payload };
    return { data: featuredData[index], message: 'Program unggulan berhasil diupdate' };
  },
  async deleteFeaturedProgram(id: string): Promise<ApiResponse<null>> {
    await delay();
    featuredData = featuredData.filter((f) => f.id !== id);
    return { data: null, message: 'Program unggulan berhasil dihapus' };
  },

  async getContact(): Promise<ApiResponse<ContactInfo>> {
    await delay();
    return { data: contactData };
  },
  async updateContact(payload: Partial<ContactInfo>): Promise<ApiResponse<ContactInfo>> {
    await delay();
    contactData = { ...contactData, ...payload, updated_at: new Date().toISOString() };
    return { data: contactData, message: 'Informasi kontak berhasil diupdate' };
  },
};
