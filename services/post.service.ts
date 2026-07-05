import { createClient } from '@/lib/supabase/client';
import { Post, PostFormData, ApiResponse } from '@/types';
import { slugify } from '@/lib/utils';

function mapPost(row: Record<string, unknown>): Post {
  const published_date =
    typeof row.published_date === 'string' ? row.published_date.slice(0, 10) : '';

  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    slug: String(row.slug ?? ''),
    content: String(row.content ?? ''),
    cover_image: String(row.cover_image ?? ''),
    author: String(row.author ?? ''),
    category: String(row.category ?? ''),
    published_date,
    status: row.status as Post['status'],
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export const postService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }): Promise<ApiResponse<Post[]>> {
    const supabase = createClient();
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (params?.status) {
      query = query.eq('status', params.status);
    }

    if (params?.category) {
      query = query.ilike('category', `%${params.category.trim()}%`);
    }

    if (params?.search) {
      const q = `%${params.search.trim()}%`;
      query = query.or(`title.ilike.${q},author.ilike.${q}`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: (data ?? []).map((row: Record<string, unknown>) => mapPost(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string): Promise<ApiResponse<Post>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return { data: mapPost(data as Record<string, unknown>) };
  },

  async create(payload: PostFormData): Promise<ApiResponse<Post>> {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const insert = {
      ...payload,
      slug: payload.slug || slugify(payload.title),
      published_date: payload.published_date || null,
      created_by: userData.user?.id ?? null,
    };
    const { data, error } = await supabase
      .from('posts')
      .insert(insert)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { data: mapPost(data as Record<string, unknown>), message: 'Berita berhasil dibuat' };
  },

  async update(id: string, payload: Partial<PostFormData>): Promise<ApiResponse<Post>> {
    const supabase = createClient();
    const update = {
      ...payload,
      ...(payload.published_date !== undefined && {
        published_date: payload.published_date || null,
      }),
    };
    const { data, error } = await supabase
      .from('posts')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { data: mapPost(data as Record<string, unknown>), message: 'Berita berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const supabase = createClient();
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { data: null, message: 'Berita berhasil dihapus' };
  },
};
