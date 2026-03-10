import { FridayDuty, FridayFormData, ApiResponse, PaginationMeta } from '@/types';
import { mockFridayDuty } from '@/lib/mock-data';
import { generateId } from '@/lib/utils';

let fridayData: FridayDuty[] = [...mockFridayDuty];
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const fridayService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    month?: string;
  }): Promise<ApiResponse<FridayDuty[]>> {
    await delay();
    let data = [...fridayData];

    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (f) =>
          f.khateeb.toLowerCase().includes(q) ||
          f.imam.toLowerCase().includes(q) ||
          f.date.includes(q)
      );
    }
    if (params?.month) {
      data = data.filter((f) => f.date.startsWith(params.month!));
    }

    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = data.slice((page - 1) * limit, page * limit);
    const meta: PaginationMeta = { page, limit, total, totalPages };
    return { data: paginatedData, meta };
  },

  async getById(id: string): Promise<ApiResponse<FridayDuty>> {
    await delay();
    const item = fridayData.find((f) => f.id === id);
    if (!item) throw new Error('Friday duty not found');
    return { data: item };
  },

  async create(payload: FridayFormData): Promise<ApiResponse<FridayDuty>> {
    await delay();
    const newItem: FridayDuty = {
      ...payload,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    fridayData = [newItem, ...fridayData];
    return { data: newItem, message: 'Jadwal Jumat berhasil ditambahkan' };
  },

  async update(id: string, payload: Partial<FridayFormData>): Promise<ApiResponse<FridayDuty>> {
    await delay();
    const index = fridayData.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Friday duty not found');
    fridayData[index] = { ...fridayData[index], ...payload, updated_at: new Date().toISOString() };
    return { data: fridayData[index], message: 'Jadwal Jumat berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay();
    fridayData = fridayData.filter((f) => f.id !== id);
    return { data: null, message: 'Jadwal Jumat berhasil dihapus' };
  },
};
