import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { ALL_MENU_KEYS, FINANCE_CATEGORIES, normalizeRole } from '@/lib/permissions';

function canManageTarget(currentRole: string, currentUserId: string, targetUserId: string, targetRole: string) {
  if (currentUserId === targetUserId) return false;
  if (currentRole === 'root_admin') return targetRole !== 'root_admin';
  if (currentRole === 'admin') return targetRole === 'staff';
  return false;
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data: currentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (profileError || !currentProfile?.is_active || !['root_admin', 'admin'].includes(currentProfile.role)) {
    return NextResponse.json({ message: 'Tidak memiliki akses membuat user' }, { status: 403 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { message: 'SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server' },
      { status: 500 }
    );
  }

  const payload = await request.json();
  const email = String(payload.email ?? '').trim().toLowerCase();
  const name = String(payload.name ?? '').trim();
  const temporaryPassword = String(payload.temporaryPassword ?? '');
  const role = normalizeRole(String(payload.role ?? 'staff'));
  const isActive = Boolean(payload.is_active ?? true);
  const menuPermissions = Array.from(new Set(payload.menuPermissions ?? [])).filter((key): key is string =>
    (ALL_MENU_KEYS as readonly string[]).includes(String(key))
  );
  const financeCategories = Array.from(new Set(payload.financeCategories ?? [])).filter((category): category is string =>
    (FINANCE_CATEGORIES as readonly string[]).includes(String(category))
  );

  if (!email) {
    return NextResponse.json({ message: 'Email wajib diisi' }, { status: 400 });
  }

  if (temporaryPassword && temporaryPassword.length < 6) {
    return NextResponse.json({ message: 'Password sementara minimal 6 karakter' }, { status: 400 });
  }

  if (role === 'root_admin' && currentProfile.role !== 'root_admin') {
    return NextResponse.json(
      { message: 'Hanya Root Admin yang bisa membuat Root Admin baru' },
      { status: 403 }
    );
  }

  if (currentProfile.role === 'admin' && role !== 'staff') {
    return NextResponse.json(
      { message: 'Admin hanya bisa membuat user Staff' },
      { status: 403 }
    );
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { data: authSetting } = await admin
    .from('app_settings')
    .select('setting_value')
    .eq('setting_key', 'auth_require_email_verification_for_new_users')
    .maybeSingle();
  const requireEmailVerification = authSetting?.setting_value === 'true';

  if (!requireEmailVerification && !temporaryPassword) {
    return NextResponse.json({ message: 'Password sementara wajib diisi' }, { status: 400 });
  }

  const { data: authData, error: authError } = !requireEmailVerification
    ? await admin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    })
    : await admin.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          name,
          role,
        },
        redirectTo: `${origin}/invite`,
      }
    );

  if (authError || !authData.user) {
    return NextResponse.json(
      { message: authError?.message ?? 'Gagal membuat user' },
      { status: 400 }
    );
  }

  const userId = authData.user.id;

  const { data: profile, error: upsertProfileError } = await admin
    .from('profiles')
    .upsert({
      id: userId,
      email,
      name: name || email.split('@')[0],
      role,
      is_active: isActive,
    })
    .select()
    .single();

  if (upsertProfileError) {
    return NextResponse.json({ message: upsertProfileError.message }, { status: 400 });
  }

  await Promise.all([
    admin.from('user_menu_permissions').delete().eq('user_id', userId),
    admin.from('user_finance_categories').delete().eq('user_id', userId),
  ]);

  if (menuPermissions.length > 0) {
    const { error } = await admin.from('user_menu_permissions').insert(
      menuPermissions.map((menuKey) => ({ user_id: userId, menu_key: menuKey }))
    );
    if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (financeCategories.length > 0) {
    const { error } = await admin.from('user_finance_categories').insert(
      financeCategories.map((category) => ({ user_id: userId, category }))
    );
    if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    data: {
      profile,
      menuPermissions,
      financeCategories,
    },
    message: requireEmailVerification ? 'User berhasil diundang' : 'User berhasil dibuat',
  });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { data: currentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (profileError || !currentProfile?.is_active || !['root_admin', 'admin'].includes(currentProfile.role)) {
    return NextResponse.json({ message: 'Tidak memiliki akses menghapus user' }, { status: 403 });
  }

  const targetUserId = new URL(request.url).searchParams.get('id');
  if (!targetUserId) {
    return NextResponse.json({ message: 'User ID wajib diisi' }, { status: 400 });
  }

  const { data: targetProfile, error: targetError } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', targetUserId)
    .single();

  if (targetError || !targetProfile) {
    return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
  }

  if (!canManageTarget(currentProfile.role, user.id, targetUserId, targetProfile.role)) {
    return NextResponse.json({ message: 'Tidak diizinkan menghapus user ini' }, { status: 403 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { message: 'SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server' },
      { status: 500 }
    );
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { error } = await admin.auth.admin.deleteUser(targetUserId);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({
    data: null,
    message: `User ${targetProfile.email ?? ''} berhasil dihapus`,
  });
}
