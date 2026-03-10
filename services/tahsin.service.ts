import { TahsinClass, TahsinFormData, ApiResponse, PaginationMeta } from '@/types';
import { mockTahsin } from '@/lib/mock-data';
import { generateId } from '@/lib/utils';

let tahsinData: TahsinClass[] = [...mockTahsin];
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const tahsinService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<TahsinClass[]>> {
    await delay();
    let data = [...tahsinData];

    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (t) =>
          t.class_name.toLowerCase().includes(q) ||
          t.teacher.toLowerCase().includes(q)
      );
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = data.slice((page - 1) * limit, page * limit);
    const meta: PaginationMeta = { page, limit, total, totalPages };
    return { data: paginatedData, meta };
  },

  async getById(id: string): Promise<ApiResponse<TahsinClass>> {
    await delay();
    const item = tahsinData.find((t) => t.id === id);
    if (!item) throw new Error('Tahsin class not found');
    return { data: item };
  },

  async create(payload: TahsinFormData): Promise<ApiResponse<TahsinClass>> {
    await delay();
    const newItem: TahsinClass = {
      ...payload,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    tahsinData = [newItem, ...tahsinData];
    return { data: newItem, message: 'Kelas Tahsin berhasil dibuat' };
  },

  async update(id: string, payload: Partial<TahsinFormData>): Promise<ApiResponse<TahsinClass>> {
    await delay();
    const index = tahsinData.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Tahsin class not found');
    tahsinData[index] = { ...tahsinData[index], ...payload, updated_at: new Date().toISOString() };
    return { data: tahsinData[index], message: 'Kelas Tahsin berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay();
    tahsinData = tahsinData.filter((t) => t.id !== id);
    return { data: null, message: 'Kelas Tahsin berhasil dihapus' };
  },
};
