import { FinanceTransaction, FinanceFormData, FinanceSummary, MonthlyFinanceData, ApiResponse, PaginationMeta } from '@/types';
import { mockFinance } from '@/lib/mock-data';
import { generateId } from '@/lib/utils';
let financeData: FinanceTransaction[] = [...mockFinance];
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const financeService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    month?: string;
  }): Promise<ApiResponse<FinanceTransaction[]>> {
    await delay();
    let data = [...financeData];

    if (params?.search) {
      const q = params.search.toLowerCase();
      data = data.filter(
        (f) => f.title.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
      );
    }
    if (params?.type) {
      data = data.filter((f) => f.type === params.type);
    }
    if (params?.month) {
      data = data.filter((f) => f.date.startsWith(params.month!));
    }

    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = data.slice((page - 1) * limit, page * limit);
    const meta: PaginationMeta = { page, limit, total, totalPages };
    return { data: paginatedData, meta };
  },

  async getById(id: string): Promise<ApiResponse<FinanceTransaction>> {
    await delay();
    const item = financeData.find((f) => f.id === id);
    if (!item) throw new Error('Transaction not found');
    return { data: item };
  },

  async create(payload: FinanceFormData): Promise<ApiResponse<FinanceTransaction>> {
    await delay();
    const newItem: FinanceTransaction = {
      ...payload,
      id: generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    financeData = [newItem, ...financeData];
    return { data: newItem, message: 'Transaksi berhasil ditambahkan' };
  },

  async update(id: string, payload: Partial<FinanceFormData>): Promise<ApiResponse<FinanceTransaction>> {
    await delay();
    const index = financeData.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Transaction not found');
    financeData[index] = { ...financeData[index], ...payload, updated_at: new Date().toISOString() };
    return { data: financeData[index], message: 'Transaksi berhasil diupdate' };
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    await delay();
    financeData = financeData.filter((f) => f.id !== id);
    return { data: null, message: 'Transaksi berhasil dihapus' };
  },

  async getSummary(): Promise<ApiResponse<FinanceSummary>> {
    await delay();
    const total_income = financeData.filter((f) => f.type === 'income').reduce((s, f) => s + f.amount, 0);
    const total_expense = financeData.filter((f) => f.type === 'expense').reduce((s, f) => s + f.amount, 0);
    const balance = total_income - total_expense;

    const monthsMap = new Map<string, MonthlyFinanceData>();
    financeData.forEach((f) => {
      const month = f.date.slice(0, 7);
      if (!monthsMap.has(month)) {
        monthsMap.set(month, { month, income: 0, expense: 0 });
      }
      const entry = monthsMap.get(month)!;
      if (f.type === 'income') entry.income += f.amount;
      else entry.expense += f.amount;
    });

    const monthly_data = Array.from(monthsMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    return {
      data: { total_income, total_expense, balance, monthly_data },
    };
  },
};
