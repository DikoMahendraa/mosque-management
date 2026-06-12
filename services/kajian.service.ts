import { createClient } from '@/lib/supabase/client';
import { Kajian, KajianFormData, ApiResponse } from '@/types';

function mapKajian(row: Record<string, unknown>): Kajian {
  const time = typeof row.time === 'string' ? row.time.slice(0, 5) : String(row.time ?? '');
  const date = typeof row.date === 'string' ? row.date.slice(0, 10) : String(row.date ?? '');
  const registrations = row.kajian_registrations as { count: number }[] | undefined;
  const registration_count = registrations?.[0]?.count ?? 0;

  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    speaker: String(row.speaker ?? ''),
    description: String(row.description ?? ''),
    date,
    time,
    location: String(row.location ?? ''),
    poster_image: String(row.poster_image ?? ''),
    status: row.status as Kajian['status'],
    registration_count,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export const kajianService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<Kajian[]>> {
    const supabase = createClient();
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('kajian')
      .select('*, kajian_registrations(count)', { count: 'exact' })
      .order('date', { ascending: false });

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    if (params?.search) {
      const q = `%${params.search.trim()}%`;
      query = query.or(`title.ilike.${q},speaker.ilike.${q},location.ilike.${q}`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: (data ?? []).map((row: Record<string, unknown>) => mapKajian(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string): Promise<ApiResponse<Kajian>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('kajian')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return { data: mapKajian(data) };
  },

  async create(payload: KajianFormData): Promise<ApiResponse<Kajian>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('kajian')
      .insert({
        ...payload,
        ...(user ? { created_by: user.id } : {}),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data: mapKajian(data), message: 'Kajian berhasil dibuat' };
  },

  async update(id: string, payload: Partial<KajianFormData>): Promise<ApiResponse<Kajian>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('kajian')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data: mapKajian(data), message: 'Kajian berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const supabase = createClient();
    const { error } = await supabase.from('kajian').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { data: null, message: 'Kajian berhasil dihapus' };
  },
};
