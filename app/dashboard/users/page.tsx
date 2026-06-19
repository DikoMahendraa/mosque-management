'use client';

import { useState } from 'react';
import { Mail, Pencil, Plus, Shield, Trash2, Users } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from '@/components/ui/Toast';
import { useDeleteUser, useInviteUser, useUpdateUserAccess, useUsersAccessList } from '@/hooks/usePermissions';
import { AppRole, MenuKey, UserAccess, UserAccessFormData } from '@/types';
import { DASHBOARD_MENUS, FINANCE_CATEGORIES } from '@/lib/permissions';
import { useAuthStore } from '@/store';

const defaultForm: UserAccessFormData = {
  email: '',
  name: '',
  role: 'staff',
  menuPermissions: ['dashboard'],
  financeCategories: [],
  is_active: true,
};

const roleLabels: Record<AppRole, string> = {
  root_admin: 'Root Admin',
  admin: 'Admin',
  staff: 'Staff',
};

function canManageUser(currentRole: AppRole | undefined, currentUserId: string | undefined, target: UserAccess) {
  if (!currentRole || !currentUserId || currentUserId === target.profile.id) return false;
  if (currentRole === 'root_admin') return target.profile.role !== 'root_admin';
  if (currentRole === 'admin') return target.profile.role === 'staff';
  return false;
}

export default function UsersPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useUsersAccessList();
  const inviteMutation = useInviteUser();
  const updateMutation = useUpdateUserAccess();
  const deleteMutation = useDeleteUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<UserAccess | null>(null);
  const [deleteItem, setDeleteItem] = useState<UserAccess | null>(null);
  const [form, setForm] = useState<UserAccessFormData>(defaultForm);

  const users = data?.data ?? [];
  const isSubmitting = inviteMutation.isPending || updateMutation.isPending;
  const canAssignRoot = user?.role === 'root_admin';
  const roleOptions = [
    ...(canAssignRoot ? [{ value: 'admin', label: 'Admin' }] : []),
    { value: 'staff', label: 'Staff' },
  ];

  const openCreate = () => {
    setEditItem(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  const openEdit = (item: UserAccess) => {
    setEditItem(item);
    setForm({
      email: item.profile.email,
      name: item.profile.name,
      role: item.profile.role,
      menuPermissions: item.menuPermissions.length > 0 ? item.menuPermissions : ['dashboard'],
      financeCategories: item.financeCategories,
      is_active: item.profile.is_active,
    });
    setIsModalOpen(true);
  };

  const toggleMenu = (menuKey: MenuKey) => {
    setForm((prev) => {
      if (menuKey === 'dashboard') return prev;

      const exists = prev.menuPermissions.includes(menuKey);
      const nextMenus = exists
        ? prev.menuPermissions.filter((key) => key !== menuKey)
        : [...prev.menuPermissions, menuKey];

      return {
        ...prev,
        menuPermissions: nextMenus.includes('dashboard') ? nextMenus : ['dashboard', ...nextMenus],
        financeCategories: nextMenus.includes('finance') ? prev.financeCategories : [],
      };
    });
  };

  const toggleFinanceCategory = (category: string) => {
    setForm((prev) => ({
      ...prev,
      financeCategories: prev.financeCategories.includes(category as typeof prev.financeCategories[number])
        ? prev.financeCategories.filter((item) => item !== category)
        : [...prev.financeCategories, category as typeof prev.financeCategories[number]],
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: UserAccessFormData = {
      ...form,
      menuPermissions: form.menuPermissions.includes('dashboard')
        ? form.menuPermissions
        : (['dashboard', ...form.menuPermissions] as MenuKey[]),
      financeCategories: form.menuPermissions.includes('finance') ? form.financeCategories : [],
    };

    try {
      if (editItem) {
        await updateMutation.mutateAsync({ userId: editItem.profile.id, data: payload });
        toast('success', 'Berhasil', 'Hak akses user berhasil diupdate');
      } else {
        await inviteMutation.mutateAsync(payload);
        toast('success', 'Berhasil', 'Undangan user berhasil dikirim');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast('error', 'Gagal', error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      await deleteMutation.mutateAsync(deleteItem.profile.id);
      toast('success', 'Berhasil', 'User berhasil dihapus');
      setDeleteItem(null);
    } catch (error) {
      toast('error', 'Gagal', error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  return (
    <DashboardLayout
      title="Users"
      description="Kelola user, akses menu dashboard, dan kategori keuangan"
      actions={<Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>Tambah User</Button>}
    >
      <Card padding="md">
        {isLoading ? <LoadingSpinner text="Memuat user..." /> :
          users.length === 0 ? (
            <EmptyState icon={Users} title="Belum ada user" action={<Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>Tambah User</Button>} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Menu</th>
                    <th className="px-4 py-3">Kategori Keuangan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((item) => (
                    <tr key={item.profile.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{item.profile.name || '-'}</p>
                        <p className="text-xs text-gray-500">{item.profile.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={item.profile.role === 'staff' ? 'default' : 'success'}>
                          {roleLabels[item.profile.role]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.profile.role === 'root_admin' || item.profile.role === 'admin'
                          ? 'Semua menu'
                          : `${item.menuPermissions.length} menu`}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {item.profile.role === 'root_admin' || item.profile.role === 'admin'
                          ? 'Semua kategori'
                          : item.financeCategories.length > 0
                            ? item.financeCategories.join(', ')
                            : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={item.profile.is_active ? 'success' : 'error'}>
                          {item.profile.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {canManageUser(user?.role, user?.id, item) ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteItem(item)}
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">
                              {user?.id === item.profile.id ? 'Akun sendiri' : 'Tidak dapat diedit'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit User' : 'Tambah User'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              required
              disabled={!!editItem}
              leftIcon={<Mail className="h-4 w-4" />}
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            <Input
              label="Nama"
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Role"
              value={form.role}
              options={roleOptions}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as AppRole }))}
            />
            <Select
              label="Status"
              value={String(form.is_active)}
              options={[
                { value: 'true', label: 'Aktif' },
                { value: 'false', label: 'Nonaktif' },
              ]}
              onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.value === 'true' }))}
            />
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <p className="font-medium text-gray-800">Akses Menu Dashboard</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {DASHBOARD_MENUS.map((menu) => (
                <label key={menu.key} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.role !== 'staff' || form.menuPermissions.includes(menu.key)}
                    disabled={form.role !== 'staff' || menu.key === 'dashboard'}
                    onChange={() => toggleMenu(menu.key)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  {menu.label}
                </label>
              ))}
            </div>
            {form.role !== 'staff' && (
              <p className="mt-2 text-xs text-gray-400">Admin otomatis memiliki akses ke semua menu.</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <p className="mb-3 font-medium text-gray-800">Kategori Keuangan</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {FINANCE_CATEGORIES.map((category) => (
                <label key={category} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.role !== 'staff' || form.financeCategories.includes(category)}
                    disabled={form.role !== 'staff' || !form.menuPermissions.includes('finance')}
                    onChange={() => toggleFinanceCategory(category)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  {category}
                </label>
              ))}
            </div>
            {form.role === 'staff' && !form.menuPermissions.includes('finance') && (
              <p className="mt-2 text-xs text-gray-400">Aktifkan menu Keuangan dulu untuk memilih kategori.</p>
            )}
            {form.role !== 'staff' && (
              <p className="mt-2 text-xs text-gray-400">Admin otomatis memiliki akses ke semua kategori keuangan.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" isLoading={isSubmitting}>{editItem ? 'Simpan Perubahan' : 'Kirim Undangan'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Konfirmasi Hapus User"
        message={`Apakah Anda yakin ingin menghapus user ${deleteItem?.profile.email ?? ''}? Akun ini akan dihapus dari Supabase Auth dan tidak bisa login lagi.`}
        confirmLabel="Hapus User"
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
