'use client';

import {
  BookOpen, CalendarDays, GraduationCap, Newspaper,
  TrendingUp, TrendingDown, DollarSign, Users, Clock,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge, { statusBadge } from '@/components/ui/Badge';
import { useKajianList } from '@/hooks/useKajian';
import { useEventList } from '@/hooks/useEvents';
import { useTahsinList } from '@/hooks/useTahsin';
import { usePostList } from '@/hooks/usePosts';
import { useFinanceSummary } from '@/hooks/useFinance';
import { useManagementList } from '@/hooks/useManagement';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import dayjs from 'dayjs';

export default function DashboardPage() {
  const { data: kajianData } = useKajianList({ limit: 100 });
  const { data: eventsData } = useEventList({ limit: 100 });
  const { data: tahsinData } = useTahsinList({ limit: 100 });
  const { data: postsData } = usePostList({ limit: 100 });
  const { data: financeData } = useFinanceSummary();
  const { data: managementData } = useManagementList({ limit: 100 });
  const { data: upcomingKajian } = useKajianList({ status: 'upcoming', limit: 3 });
  const { data: upcomingEvents } = useEventList({ status: 'upcoming', limit: 3 });

  const stats = financeData?.data;
  const chartData = (stats?.monthly_data ?? []).map((m) => ({
    month: dayjs(m.month + '-01').format('MMM'),
    Pemasukan: m.income,
    Pengeluaran: m.expense,
  }));

  return (
    <DashboardLayout title="Dashboard" description="Selamat datang di Dashboard Masjid Darussalam">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Kajian"
          value={kajianData?.meta?.total ?? 0}
          icon={BookOpen}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Total Events"
          value={eventsData?.meta?.total ?? 0}
          icon={CalendarDays}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Kelas Tahsin"
          value={tahsinData?.meta?.total ?? 0}
          icon={GraduationCap}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Total Berita"
          value={postsData?.meta?.total ?? 0}
          icon={Newspaper}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Total Pemasukan"
          value={formatCurrency(stats?.total_income ?? 0)}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatCurrency(stats?.total_expense ?? 0)}
          icon={TrendingDown}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <StatCard
          title="Saldo Kas"
          value={formatCurrency(stats?.balance ?? 0)}
          icon={DollarSign}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <StatCard
          title="Pengurus Aktif"
          value={managementData?.meta?.total ?? 0}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
      </div>

      {/* Charts + Upcoming */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Finance Chart */}
        <Card className="lg:col-span-2" padding="md">
          <CardHeader title="Arus Keuangan" description="Pemasukan & pengeluaran per bulan" />
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
              />
              <Tooltip
                formatter={(val) => formatCurrency(Number(val))}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Pengeluaran" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Info */}
        <div className="flex flex-col gap-4">
          <Card padding="md">
            <CardHeader
              title="Kajian Mendatang"
              actions={<Clock className="h-4 w-4 text-gray-400" />}
            />
            <div className="space-y-3">
              {(upcomingKajian?.data ?? []).length === 0 ? (
                <p className="text-sm text-gray-400">Tidak ada kajian mendatang</p>
              ) : (
                upcomingKajian?.data.map((k) => (
                  <div key={k.id} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                      <BookOpen className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">{k.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(k.date)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card padding="md">
            <CardHeader
              title="Event Mendatang"
              actions={<CalendarDays className="h-4 w-4 text-gray-400" />}
            />
            <div className="space-y-3">
              {(upcomingEvents?.data ?? []).length === 0 ? (
                <p className="text-sm text-gray-400">Tidak ada event mendatang</p>
              ) : (
                upcomingEvents?.data.map((e) => (
                  <div key={e.id} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
                      <CalendarDays className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">{e.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(e.event_date)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Kajian Table */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card padding="md">
          <CardHeader title="Kajian Terbaru" />
          <div className="space-y-2">
            {(kajianData?.data ?? []).slice(0, 5).map((k) => (
              <div key={k.id} className="flex items-center justify-between rounded-xl p-2.5 hover:bg-gray-50 transition-colors">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">{k.title}</p>
                  <p className="text-xs text-gray-400">{k.speaker} · {formatDate(k.date)}</p>
                </div>
                <Badge variant={statusBadge(k.status)}>
                  {k.status === 'upcoming' ? 'Mendatang' : 'Selesai'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <CardHeader title="Event Terbaru" />
          <div className="space-y-2">
            {(eventsData?.data ?? []).slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-xl p-2.5 hover:bg-gray-50 transition-colors">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">{e.title}</p>
                  <p className="text-xs text-gray-400">{formatDate(e.event_date)}</p>
                </div>
                <Badge variant={statusBadge(e.status)}>
                  {e.status === 'upcoming' ? 'Mendatang' : 'Selesai'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
