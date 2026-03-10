import { Kajian, KajianFormData, ApiResponse, PaginationMeta } from '@/types';
import { mockKajian } from '@/lib/mock-data';
import { generateId } from '@/lib/utils';

let kajianData: Kajian[] = [...mockKajian];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const kajianService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<Kajian[]>> {
    await delay();
    let data = [...kajianData];

    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (k) =>
          k.title.toLowerCase().includes(q) ||
          k.speaker.toLowerCase().includes(q) ||
          k.location.toLowerCase().includes(q)
      );
    }

    if (params?.status) {
      data = data.filter((k) => k.status === params.status);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedData = data.slice(start, start + limit);

    const meta: PaginationMeta = { page, limit, total, totalPages };
    return { data: paginatedData, meta };
  },

  async getById(id: string): Promise<ApiResponse<Kajian>> {
    await delay();
    const item = kajianData.find((k) => k.id === id);
    if (!item) throw new Error('Kajian not found');
    return { data: item };
  },

  async create(payload: KajianFormData): Promise<ApiResponse<Kajian>> {
    await delay();
    const newItem: Kajian = {
      ...payload,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    kajianData = [newItem, ...kajianData];
    return { data: newItem, message: 'Kajian berhasil dibuat' };
  },

  async update(id: string, payload: Partial<KajianFormData>): Promise<ApiResponse<Kajian>> {
    await delay();
    const index = kajianData.findIndex((k) => k.id === id);
    if (index === -1) throw new Error('Kajian not found');
    kajianData[index] = {
      ...kajianData[index],
      ...payload,
      updated_at: new Date().toISOString(),
    };
    return { data: kajianData[index], message: 'Kajian berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay();
    kajianData = kajianData.filter((k) => k.id !== id);
    return { data: null, message: 'Kajian berhasil dihapus' };
  },
};
