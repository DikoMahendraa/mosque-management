import { createClient } from '@/lib/supabase/client';
import {
  UserAccess,
  UserAccessFormData,
  UserProfile,
  MenuKey,
  FinanceCategory,
  ApiResponse,
} from '@/types';
import { ALL_MENU_KEYS, FINANCE_CATEGORIES, normalizeRole } from '@/lib/permissions';

type ProfileRow = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
};

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email ?? '',
    name: row.name ?? row.email?.split('@')[0] ?? '',
    role: normalizeRole(row.role),
    is_active: row.is_active ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function uniqueMenuKeys(keys: string[]): MenuKey[] {
  return Array.from(new Set(keys)).filter((key): key is MenuKey =>
    (ALL_MENU_KEYS as readonly string[]).includes(key)
  );
}

function uniqueFinanceCategories(categories: string[]): FinanceCategory[] {
  return Array.from(new Set(categories)).filter((category): category is FinanceCategory =>
    (FINANCE_CATEGORIES as readonly string[]).includes(category)
  );
}

export const permissionsService = {
  async getCurrentUserAccess(userId: string): Promise<UserAccess | null> {
    const supabase = createClient();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (!profile) return null;

    const [{ data: menuRows, error: menuError }, { data: financeRows, error: financeError }] =
      await Promise.all([
        supabase.from('user_menu_permissions').select('menu_key').eq('user_id', userId),
        supabase.from('user_finance_categories').select('category').eq('user_id', userId),
      ]);

    if (menuError) throw new Error(menuError.message);
    if (financeError) throw new Error(financeError.message);

    return {
      profile: mapProfile(profile as ProfileRow),
      menuPermissions: uniqueMenuKeys((menuRows ?? []).map((row) => String(row.menu_key))),
      financeCategories: uniqueFinanceCategories((financeRows ?? []).map((row) => String(row.category))),
    };
  },

  async listUsers(): Promise<ApiResponse<UserAccess[]>> {
    const supabase = createClient();

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const userIds = (profiles ?? []).map((profile) => String(profile.id));
    if (userIds.length === 0) return { data: [] };

    const [{ data: menuRows, error: menuError }, { data: financeRows, error: financeError }] =
      await Promise.all([
        supabase.from('user_menu_permissions').select('user_id, menu_key').in('user_id', userIds),
        supabase.from('user_finance_categories').select('user_id, category').in('user_id', userIds),
      ]);

    if (menuError) throw new Error(menuError.message);
    if (financeError) throw new Error(financeError.message);

    return {
      data: (profiles ?? []).map((profile) => {
        const id = String(profile.id);
        return {
          profile: mapProfile(profile as ProfileRow),
          menuPermissions: uniqueMenuKeys(
            (menuRows ?? [])
              .filter((row) => String(row.user_id) === id)
              .map((row) => String(row.menu_key))
          ),
          financeCategories: uniqueFinanceCategories(
            (financeRows ?? [])
              .filter((row) => String(row.user_id) === id)
              .map((row) => String(row.category))
          ),
        };
      }),
    };
  },

  async updateUserAccess(userId: string, payload: UserAccessFormData): Promise<ApiResponse<UserAccess>> {
    const supabase = createClient();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        name: payload.name,
        email: payload.email,
        role: payload.role,
        is_active: payload.is_active,
      })
      .eq('id', userId)
      .select()
      .single();

    if (profileError) throw new Error(profileError.message);

    const [{ error: deleteMenuError }, { error: deleteFinanceError }] = await Promise.all([
      supabase.from('user_menu_permissions').delete().eq('user_id', userId),
      supabase.from('user_finance_categories').delete().eq('user_id', userId),
    ]);

    if (deleteMenuError) throw new Error(deleteMenuError.message);
    if (deleteFinanceError) throw new Error(deleteFinanceError.message);

    const menuPermissions = uniqueMenuKeys(payload.menuPermissions);
    const financeCategories = uniqueFinanceCategories(payload.financeCategories);

    if (menuPermissions.length > 0) {
      const { error: menuError } = await supabase.from('user_menu_permissions').insert(
        menuPermissions.map((menuKey) => ({
          user_id: userId,
          menu_key: menuKey,
        }))
      );
      if (menuError) throw new Error(menuError.message);
    }

    if (financeCategories.length > 0) {
      const { error: financeError } = await supabase.from('user_finance_categories').insert(
        financeCategories.map((category) => ({
          user_id: userId,
          category,
        }))
      );
      if (financeError) throw new Error(financeError.message);
    }

    return {
      data: {
        profile: mapProfile(profile as ProfileRow),
        menuPermissions,
        financeCategories,
      },
      message: 'Hak akses user berhasil diupdate',
    };
  },

  async inviteUser(payload: UserAccessFormData): Promise<ApiResponse<UserAccess>> {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = await response.json();
    if (!response.ok) {
      throw new Error(body?.message ?? 'Gagal membuat user');
    }

    return body;
  },

  async deleteUser(userId: string): Promise<ApiResponse<null>> {
    const response = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });

    const body = await response.json();
    if (!response.ok) {
      throw new Error(body?.message ?? 'Gagal menghapus user');
    }

    return body;
  },
};
