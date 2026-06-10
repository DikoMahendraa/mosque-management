import { createClient } from '@/lib/supabase/client';
import {
  FinanceTransaction,
  FinanceFormData,
  FinanceSummary,
  MonthlyFinanceData,
  ApiResponse,
} from '@/types';

function mapFinanceTransaction(row: Record<string, unknown>): FinanceTransaction {
  const date = typeof row.date === 'string' ? row.date.slice(0, 10) : String(row.date ?? '');

  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    category: String(row.category ?? ''),
    amount: Number(row.amount ?? 0),
    date,
    description: String(row.description ?? ''),
    type: row.type as FinanceTransaction['type'],
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function buildMonthlyData(
  rows: Array<{ type: string; amount: number; date: string }>
): MonthlyFinanceData[] {
  const monthsMap = new Map<string, MonthlyFinanceData>();

  rows.forEach((row) => {
    const month = row.date.slice(0, 7);
    if (!monthsMap.has(month)) {
      monthsMap.set(month, { month, income: 0, expense: 0 });
    }
    const entry = monthsMap.get(month)!;
    if (row.type === 'income') entry.income += row.amount;
    else entry.expense += row.amount;
  });

  return Array.from(monthsMap.values()).sort((a, b) => a.month.localeCompare(b.month));
}

export const financeService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    month?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<FinanceTransaction[]>> {
    const supabase = createClient();
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('finance_transactions')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false });

    if (params?.type) {
      query = query.eq('type', params.type);
    }

    if (params?.start_date && params?.end_date) {
      query = query.gte('date', params.start_date).lte('date', params.end_date);
    } else if (params?.month) {
      const start = `${params.month}-01`;
      const end = new Date(
        Number(params.month.slice(0, 4)),
        Number(params.month.slice(5, 7)),
        0
      );
      const endDate = `${params.month}-${String(end.getDate()).padStart(2, '0')}`;
      query = query.gte('date', start).lte('date', endDate);
    }

    if (params?.search) {
      const q = `%${params.search.trim()}%`;
      query = query.or(`title.ilike.${q},category.ilike.${q}`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: (data ?? []).map((row: Record<string, unknown>) => mapFinanceTransaction(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string): Promise<ApiResponse<FinanceTransaction>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('finance_transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return { data: mapFinanceTransaction(data) };
  },

  async create(payload: FinanceFormData): Promise<ApiResponse<FinanceTransaction>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('finance_transactions')
      .insert({
        ...payload,
        ...(user ? { created_by: user.id } : {}),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data: mapFinanceTransaction(data), message: 'Transaksi berhasil ditambahkan' };
  },

  async update(
    id: string,
    payload: Partial<FinanceFormData>
  ): Promise<ApiResponse<FinanceTransaction>> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('finance_transactions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { data: mapFinanceTransaction(data), message: 'Transaksi berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    const supabase = createClient();
    const { error } = await supabase.from('finance_transactions').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { data: null, message: 'Transaksi berhasil dihapus' };
  },

  async getSummary(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<FinanceSummary>> {
    const supabase = createClient();
    
    let query = supabase
      .from('finance_transactions')
      .select('type, amount, date');

    if (params?.start_date && params?.end_date) {
      query = query.gte('date', params.start_date).lte('date', params.end_date);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const rows = (data ?? []).map((row) => ({
      type: String(row.type),
      amount: Number(row.amount ?? 0),
      date: typeof row.date === 'string' ? row.date.slice(0, 10) : String(row.date ?? ''),
    }));

    const total_income = rows
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);
    const total_expense = rows
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      data: {
        total_income,
        total_expense,
        balance: total_income - total_expense,
        monthly_data: buildMonthlyData(rows),
      },
    };
  },

  async getAllForExport(params?: {
    search?: string;
    type?: string;
    month?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<FinanceTransaction[]> {
    const supabase = createClient();

    let query = supabase
      .from('finance_transactions')
      .select('*')
      .order('date', { ascending: false });

    if (params?.type) {
      query = query.eq('type', params.type);
    }

    if (params?.start_date && params?.end_date) {
      query = query.gte('date', params.start_date).lte('date', params.end_date);
    } else if (params?.month) {
      const start = `${params.month}-01`;
      const end = new Date(
        Number(params.month.slice(0, 4)),
        Number(params.month.slice(5, 7)),
        0
      );
      const endDate = `${params.month}-${String(end.getDate()).padStart(2, '0')}`;
      query = query.gte('date', start).lte('date', endDate);
    }

    if (params?.search) {
      const q = `%${params.search.trim()}%`;
      query = query.or(`title.ilike.${q},category.ilike.${q}`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return (data ?? []).map((row: Record<string, unknown>) => mapFinanceTransaction(row));
  },
};
