import { createClient } from '@/lib/supabase/client';
import { MosqueAdmin, AdminFormData, ApiResponse } from '@/types';

function mapMosqueAdmin(row: Record<string, unknown>): MosqueAdmin {
  const period_start = typeof row.period_start === 'string' ? row.period_start.slice(0, 10) : String(row.period_start ?? '');
  const period_end = typeof row.period_end === 'string' ? row.period_end.slice(0, 10) : String(row.period_end ?? '');

  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    position: String(row.position ?? ''),
    phone: String(row.phone ?? ''),
    email: String(row.email ?? ''),
    photo: String(row.photo ?? ''),
    period_start,
    period_end,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export const managementService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<MosqueAdmin[]>> {
    const supabase = createClient();
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('mosque_admins')
      .select('*', { count: 'exact' })
      .order('period_start', { ascending: false });

    if (params?.search) {
      const q = `%${params.search.trim()}%`;
      query = query.or(`name.ilike.${q},position.ilike.${q}`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: (data ?? []).map((row: Record<string, unknown>) => mapMosqueAdmin(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string): Promise<ApiResponse<MosqueAdmin>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('mosque_admins')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return { data: mapMosqueAdmin(data) };
  },

  async create(payload: AdminFormData): Promise<ApiResponse<MosqueAdmin>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('mosque_admins')
      .insert({
        ...payload,
        ...(user ? { created_by: user.id } : {}),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data: mapMosqueAdmin(data), message: 'Pengurus berhasil ditambahkan' };
  },

  async update(id: string, payload: Partial<AdminFormData>): Promise<ApiResponse<MosqueAdmin>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('mosque_admins')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data: mapMosqueAdmin(data), message: 'Pengurus berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const supabase = createClient();
    const { error } = await supabase.from('mosque_admins').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { data: null, message: 'Pengurus berhasil dihapus' };
  },
};
