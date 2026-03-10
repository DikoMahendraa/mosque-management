import { MosqueAdmin, AdminFormData, ApiResponse, PaginationMeta } from '@/types';
import { mockManagement } from '@/lib/mock-data';
import { generateId } from '@/lib/utils';

let managementData: MosqueAdmin[] = [...mockManagement];
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const managementService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<MosqueAdmin[]>> {
    await delay();
    let data = [...managementData];

    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (m) => m.name.toLowerCase().includes(q) || m.position.toLowerCase().includes(q)
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

  async getById(id: string): Promise<ApiResponse<MosqueAdmin>> {
    await delay();
    const item = managementData.find((m) => m.id === id);
    if (!item) throw new Error('Admin not found');
    return { data: item };
  },

  async create(payload: AdminFormData): Promise<ApiResponse<MosqueAdmin>> {
    await delay();
    const newItem: MosqueAdmin = {
      ...payload,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    managementData = [newItem, ...managementData];
    return { data: newItem, message: 'Pengurus berhasil ditambahkan' };
  },

  async update(id: string, payload: Partial<AdminFormData>): Promise<ApiResponse<MosqueAdmin>> {
    await delay();
    const index = managementData.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Admin not found');
    managementData[index] = { ...managementData[index], ...payload, updated_at: new Date().toISOString() };
    return { data: managementData[index], message: 'Pengurus berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay();
    managementData = managementData.filter((m) => m.id !== id);
    return { data: null, message: 'Pengurus berhasil dihapus' };
  },
};
