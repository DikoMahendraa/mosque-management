import { createClient } from '@/lib/supabase/client';
import { MosqueEvent, EventFormData, ApiResponse } from '@/types';

function mapEvent(row: Record<string, unknown>): MosqueEvent {
  const event_date = typeof row.event_date === 'string' ? row.event_date.slice(0, 10) : String(row.event_date ?? '');
  const registrations = row.event_registrations as { count: number }[] | undefined;
  const registration_count = registrations?.[0]?.count ?? 0;

  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    event_date,
    location: String(row.location ?? ''),
    poster: String(row.poster ?? ''),
    status: row.status as MosqueEvent['status'],
    registration_count,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export const eventService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<MosqueEvent[]>> {
    const supabase = createClient();
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('events')
      .select('*, event_registrations(count)', { count: 'exact' })
      .order('event_date', { ascending: false });

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    if (params?.search) {
      const q = `%${params.search.trim()}%`;
      query = query.or(`title.ilike.${q},location.ilike.${q}`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: (data ?? []).map((row: Record<string, unknown>) => mapEvent(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string): Promise<ApiResponse<MosqueEvent>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return { data: mapEvent(data) };
  },

  async create(payload: EventFormData): Promise<ApiResponse<MosqueEvent>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...payload,
        ...(user ? { created_by: user.id } : {}),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data: mapEvent(data), message: 'Event berhasil dibuat' };
  },

  async update(id: string, payload: Partial<EventFormData>): Promise<ApiResponse<MosqueEvent>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data: mapEvent(data), message: 'Event berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const supabase = createClient();
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { data: null, message: 'Event berhasil dihapus' };
  },
};
