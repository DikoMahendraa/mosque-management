import { createClient } from '@/lib/supabase/client';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB in bytes
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface UploadResult {
  url: string;
  path: string;
}

export const uploadService = {
  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'File tidak ditemukan' };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Format file tidak didukung. Gunakan: JPEG, PNG, atau WebP' 
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `Ukuran file maksimal 1 MB. File Anda: ${(file.size / 1024 / 1024).toFixed(2)} MB` 
      };
    }

    return { valid: true };
  },

  /**
   * Upload image to Supabase Storage
   */
  async uploadEventImage(file: File): Promise<UploadResult> {
    return this.uploadImage(file, 'event-images', 'events');
  },

  /**
   * Upload kajian image to Supabase Storage
   */
  async uploadKajianImage(file: File): Promise<UploadResult> {
    return this.uploadImage(file, 'event-images', 'kajian');
  },

  /**
   * Generic upload image method
   */
  async uploadImage(file: File, bucket: string, folder: string): Promise<UploadResult> {
    const supabase = createClient();

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload gagal: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  },

  /**
   * Delete image from Supabase Storage
   */
  async deleteEventImage(path: string): Promise<void> {
    return this.deleteImage('event-images', path);
  },

  /**
   * Delete kajian image from Supabase Storage
   */
  async deleteKajianImage(path: string): Promise<void> {
    return this.deleteImage('event-images', path);
  },

  /**
   * Generic delete image method
   */
  async deleteImage(bucket: string, path: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Gagal menghapus file: ${error.message}`);
    }
  },

  /**
   * Extract storage path from public URL
   */
  extractPathFromUrl(url: string): string | null {
    try {
      const match = url.match(/event-images\/(.+)$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  },
};
