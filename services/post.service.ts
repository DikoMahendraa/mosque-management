import { Post, PostFormData, ApiResponse, PaginationMeta } from '@/types';
import { mockPosts } from '@/lib/mock-data';
import { generateId, slugify } from '@/lib/utils';

let postData: Post[] = [...mockPosts];
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const postService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<Post[]>> {
    await delay();
    let data = [...postData];

    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q)
      );
    }
    if (params?.status) {
      data = data.filter((p) => p.status === params.status);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = data.slice((page - 1) * limit, page * limit);
    const meta: PaginationMeta = { page, limit, total, totalPages };
    return { data: paginatedData, meta };
  },

  async getById(id: string): Promise<ApiResponse<Post>> {
    await delay();
    const item = postData.find((p) => p.id === id);
    if (!item) throw new Error('Post not found');
    return { data: item };
  },

  async create(payload: PostFormData): Promise<ApiResponse<Post>> {
    await delay();
    const newItem: Post = {
      ...payload,
      id: generateId(),
      slug: payload.slug || slugify(payload.title),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    postData = [newItem, ...postData];
    return { data: newItem, message: 'Post berhasil dibuat' };
  },

  async update(id: string, payload: Partial<PostFormData>): Promise<ApiResponse<Post>> {
    await delay();
    const index = postData.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Post not found');
    postData[index] = { ...postData[index], ...payload, updated_at: new Date().toISOString() };
    return { data: postData[index], message: 'Post berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay();
    postData = postData.filter((p) => p.id !== id);
    return { data: null, message: 'Post berhasil dihapus' };
  },
};
