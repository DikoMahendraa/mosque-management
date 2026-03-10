import { BerbagiProgram, BerbagiFormData, ApiResponse, PaginationMeta } from '@/types';
import { mockBerbagi } from '@/lib/mock-data';
import { generateId } from '@/lib/utils';

let berbagiData: BerbagiProgram[] = [...mockBerbagi];
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const berbagiService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<BerbagiProgram[]>> {
    await delay();
    let data = [...berbagiData];

    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter((b) => b.program_name.toLowerCase().includes(q));
    }
    if (params?.status) {
      data = data.filter((b) => b.status === params.status);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = data.slice((page - 1) * limit, page * limit);
    const meta: PaginationMeta = { page, limit, total, totalPages };
    return { data: paginatedData, meta };
  },

  async getById(id: string): Promise<ApiResponse<BerbagiProgram>> {
    await delay();
    const item = berbagiData.find((b) => b.id === id);
    if (!item) throw new Error('Program not found');
    return { data: item };
  },

  async create(payload: BerbagiFormData): Promise<ApiResponse<BerbagiProgram>> {
    await delay();
    const newItem: BerbagiProgram = {
      ...payload,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    berbagiData = [newItem, ...berbagiData];
    return { data: newItem, message: 'Program berhasil dibuat' };
  },

  async update(id: string, payload: Partial<BerbagiFormData>): Promise<ApiResponse<BerbagiProgram>> {
    await delay();
    const index = berbagiData.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Program not found');
    berbagiData[index] = { ...berbagiData[index], ...payload, updated_at: new Date().toISOString() };
    return { data: berbagiData[index], message: 'Program berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay();
    berbagiData = berbagiData.filter((b) => b.id !== id);
    return { data: null, message: 'Program berhasil dihapus' };
  },
};
