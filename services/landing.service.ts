import {
  HeroSection,
  AboutSection,
  VisionMission,
  FeaturedProgram,
  ContactInfo,
  ApiResponse,
} from '@/types';
import { createClient } from '@/lib/supabase/client';

export const landingService = {
  // HERO SECTION
  async getHero(): Promise<ApiResponse<HeroSection>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('hero_sections')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    // If no data exists, return default structure
    if (!data) {
      return {
        data: {
          id: '',
          title: '',
          subtitle: '',
          description: '',
          image: '',
          button_text: '',
          button_link: '',
          updated_at: new Date().toISOString(),
        },
      };
    }

    return { data };
  },

  async updateHero(payload: Partial<HeroSection>): Promise<ApiResponse<HeroSection>> {
    const supabase = createClient();
    
    // Try to update existing record
    const { data: existing } = await supabase
      .from('hero_sections')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing) {
      // Update existing
      result = await supabase
        .from('hero_sections')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Create new
      result = await supabase
        .from('hero_sections')
        .insert({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    if (result.error) throw new Error(result.error.message);
    return { data: result.data, message: 'Hero section berhasil diupdate' };
  },

  // ABOUT SECTION
  async getAbout(): Promise<ApiResponse<AboutSection>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('about_sections')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    if (!data) {
      return {
        data: {
          id: '',
          title: '',
          description: '',
          image: '',
          updated_at: new Date().toISOString(),
        },
      };
    }

    return { data };
  },

  async updateAbout(payload: Partial<AboutSection>): Promise<ApiResponse<AboutSection>> {
    const supabase = createClient();
    
    const { data: existing } = await supabase
      .from('about_sections')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing) {
      result = await supabase
        .from('about_sections')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('about_sections')
        .insert({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    if (result.error) throw new Error(result.error.message);
    return { data: result.data, message: 'Tentang masjid berhasil diupdate' };
  },

  // VISION & MISSION
  async getVisionMission(): Promise<ApiResponse<VisionMission>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('vision_missions')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    if (!data) {
      return {
        data: {
          id: '',
          vision: '',
          missions: [],
          updated_at: new Date().toISOString(),
        },
      };
    }

    return { data };
  },

  async updateVisionMission(payload: Partial<VisionMission>): Promise<ApiResponse<VisionMission>> {
    const supabase = createClient();
    
    const { data: existing } = await supabase
      .from('vision_missions')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing) {
      result = await supabase
        .from('vision_missions')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('vision_missions')
        .insert({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    if (result.error) throw new Error(result.error.message);
    return { data: result.data, message: 'Visi & Misi berhasil diupdate' };
  },

  // FEATURED PROGRAMS
  async getFeaturedPrograms(): Promise<ApiResponse<FeaturedProgram[]>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('featured_programs')
      .select('*')
      .order('order', { ascending: true });

    if (error) throw new Error(error.message);
    return { data: data || [] };
  },

  async createFeaturedProgram(payload: Omit<FeaturedProgram, 'id'>): Promise<ApiResponse<FeaturedProgram>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('featured_programs')
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data, message: 'Program unggulan berhasil ditambahkan' };
  },

  async updateFeaturedProgram(id: string, payload: Partial<FeaturedProgram>): Promise<ApiResponse<FeaturedProgram>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('featured_programs')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data, message: 'Program unggulan berhasil diupdate' };
  },

  async deleteFeaturedProgram(id: string): Promise<ApiResponse<null>> {
    const supabase = createClient();
    const { error } = await supabase
      .from('featured_programs')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { data: null, message: 'Program unggulan berhasil dihapus' };
  },

  // CONTACT INFO
  async getContact(): Promise<ApiResponse<ContactInfo>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    if (!data) {
      return {
        data: {
          id: '',
          address: '',
          phone: '',
          email: '',
          maps_embed: '',
          social_instagram: '',
          social_youtube: '',
          social_facebook: '',
          updated_at: new Date().toISOString(),
        },
      };
    }

    return { data };
  },

  async updateContact(payload: Partial<ContactInfo>): Promise<ApiResponse<ContactInfo>> {
    const supabase = createClient();
    
    const { data: existing } = await supabase
      .from('contact_info')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing) {
      result = await supabase
        .from('contact_info')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('contact_info')
        .insert({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    if (result.error) throw new Error(result.error.message);
    return { data: result.data, message: 'Informasi kontak berhasil diupdate' };
  },
};
