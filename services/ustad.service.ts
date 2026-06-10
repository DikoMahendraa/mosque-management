import { createClient } from '@/lib/supabase/client';
import { Ustad, UstadFormData, ApiResponse } from '@/types';

function mapUstad(row: Record<string, unknown>): Ustad {
  return {
    id: String(row.id),
    nama: String(row.nama ?? ''),
    nomor_whatsapp: String(row.nomor_whatsapp ?? ''),
    alamat: String(row.alamat ?? ''),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export const ustadService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<Ustad[]>> {
    const supabase = createClient();
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('ustad')
      .select('*', { count: 'exact' })
      .order('nama', { ascending: true });

    if (params?.search) {
      const q = `%${params.search.trim()}%`;
      query = query.or(`nama.ilike.${q},nomor_whatsapp.ilike.${q},alamat.ilike.${q}`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: (data ?? []).map((row: Record<string, unknown>) => mapUstad(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string): Promise<ApiResponse<Ustad>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ustad')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return { data: mapUstad(data) };
  },

  async create(payload: UstadFormData): Promise<ApiResponse<Ustad>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('ustad')
      .insert({
        ...payload,
        ...(user ? { created_by: user.id } : {}),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data: mapUstad(data), message: 'Ustad berhasil ditambahkan' };
  },

  async update(id: string, payload: Partial<UstadFormData>): Promise<ApiResponse<Ustad>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('ustad')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data: mapUstad(data), message: 'Ustad berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const supabase = createClient();
    const { error } = await supabase.from('ustad').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { data: null, message: 'Ustad berhasil dihapus' };
  },

  async checkDuplicateWhatsApp(
    nomorWhatsapp: string,
    excludeId?: string
  ): Promise<boolean> {
    const supabase = createClient();
    let query = supabase
      .from('ustad')
      .select('id')
      .eq('nomor_whatsapp', nomorWhatsapp);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data?.length ?? 0) > 0;
  },
};
