import { GalleryItem, GalleryFormData, ApiResponse, PaginationMeta } from '@/types';
import { mockGallery } from '@/lib/mock-data';
import { generateId } from '@/lib/utils';

let galleryData: GalleryItem[] = [...mockGallery];
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const galleryService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<ApiResponse<GalleryItem[]>> {
    await delay();
    let data = [...galleryData];

    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (g) => g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
      );
    }
    if (params?.category) {
      data = data.filter((g) => g.category === params.category);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 12;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = data.slice((page - 1) * limit, page * limit);
    const meta: PaginationMeta = { page, limit, total, totalPages };
    return { data: paginatedData, meta };
  },

  async getById(id: string): Promise<ApiResponse<GalleryItem>> {
    await delay();
    const item = galleryData.find((g) => g.id === id);
    if (!item) throw new Error('Gallery item not found');
    return { data: item };
  },

  async create(payload: GalleryFormData): Promise<ApiResponse<GalleryItem>> {
    await delay();
    const newItem: GalleryItem = {
      ...payload,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    galleryData = [newItem, ...galleryData];
    return { data: newItem, message: 'Foto berhasil ditambahkan' };
  },

  async update(id: string, payload: Partial<GalleryFormData>): Promise<ApiResponse<GalleryItem>> {
    await delay();
    const index = galleryData.findIndex((g) => g.id === id);
    if (index === -1) throw new Error('Gallery item not found');
    galleryData[index] = { ...galleryData[index], ...payload, updated_at: new Date().toISOString() };
    return { data: galleryData[index], message: 'Foto berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay();
    galleryData = galleryData.filter((g) => g.id !== id);
    return { data: null, message: 'Foto berhasil dihapus' };
  },

  getCategories(): string[] {
    return [...new Set(galleryData.map((g) => g.category))];
  },
};
