import { MosqueEvent, EventFormData, ApiResponse, PaginationMeta } from '@/types';
import { mockEvents } from '@/lib/mock-data';
import { generateId } from '@/lib/utils';

let eventData: MosqueEvent[] = [...mockEvents];
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const eventService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<MosqueEvent[]>> {
    await delay();
    let data = [...eventData];

    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }
    if (params?.status) {
      data = data.filter((e) => e.status === params.status);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = data.slice((page - 1) * limit, page * limit);
    const meta: PaginationMeta = { page, limit, total, totalPages };
    return { data: paginatedData, meta };
  },

  async getById(id: string): Promise<ApiResponse<MosqueEvent>> {
    await delay();
    const item = eventData.find((e) => e.id === id);
    if (!item) throw new Error('Event not found');
    return { data: item };
  },

  async create(payload: EventFormData): Promise<ApiResponse<MosqueEvent>> {
    await delay();
    const newItem: MosqueEvent = {
      ...payload,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    eventData = [newItem, ...eventData];
    return { data: newItem, message: 'Event berhasil dibuat' };
  },

  async update(id: string, payload: Partial<EventFormData>): Promise<ApiResponse<MosqueEvent>> {
    await delay();
    const index = eventData.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Event not found');
    eventData[index] = { ...eventData[index], ...payload, updated_at: new Date().toISOString() };
    return { data: eventData[index], message: 'Event berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay();
    eventData = eventData.filter((e) => e.id !== id);
    return { data: null, message: 'Event berhasil dihapus' };
  },
};
