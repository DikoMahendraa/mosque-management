import { PrayerSchedule, PrayerFormData, ApiResponse, PaginationMeta } from '@/types';
import { mockPrayerSchedule } from '@/lib/mock-data';
import { generateId } from '@/lib/utils';

let prayerData: PrayerSchedule[] = [...mockPrayerSchedule];
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const prayerService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    month?: string;
  }): Promise<ApiResponse<PrayerSchedule[]>> {
    await delay();
    let data = [...prayerData];

    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (p) =>
          p.fajr_imam.toLowerCase().includes(q) ||
          p.dhuhr_imam.toLowerCase().includes(q) ||
          p.date.includes(q)
      );
    }
    if (params?.month) {
      data = data.filter((p) => p.date.startsWith(params.month!));
    }

    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 31;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = data.slice((page - 1) * limit, page * limit);
    const meta: PaginationMeta = { page, limit, total, totalPages };
    return { data: paginatedData, meta };
  },

  async getById(id: string): Promise<ApiResponse<PrayerSchedule>> {
    await delay();
    const item = prayerData.find((p) => p.id === id);
    if (!item) throw new Error('Prayer schedule not found');
    return { data: item };
  },

  async create(payload: PrayerFormData): Promise<ApiResponse<PrayerSchedule>> {
    await delay();
    const newItem: PrayerSchedule = {
      ...payload,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    prayerData = [newItem, ...prayerData];
    return { data: newItem, message: 'Jadwal sholat berhasil ditambahkan' };
  },

  async update(id: string, payload: Partial<PrayerFormData>): Promise<ApiResponse<PrayerSchedule>> {
    await delay();
    const index = prayerData.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Prayer schedule not found');
    prayerData[index] = { ...prayerData[index], ...payload, updated_at: new Date().toISOString() };
    return { data: prayerData[index], message: 'Jadwal sholat berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay();
    prayerData = prayerData.filter((p) => p.id !== id);
    return { data: null, message: 'Jadwal sholat berhasil dihapus' };
  },
};
