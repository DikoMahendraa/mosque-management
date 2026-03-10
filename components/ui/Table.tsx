'use client';

import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  className?: string;
}

export default function Table<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'Tidak ada data',
  sortKey,
  sortDir,
  onSort,
  className,
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-gray-100', className)}>
      <table className="w-full min-w-max text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500',
                  col.sortable && 'cursor-pointer select-none hover:text-gray-700',
                  col.className
                )}
                onClick={() => col.sortable && onSort?.(String(col.key))}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="text-gray-300">
                      {sortKey === String(col.key) ? (
                        sortDir === 'asc' ? (
                          <ChevronUp className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-emerald-500" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <div className="h-4 rounded-lg bg-gray-100" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.key)} className={cn('px-4 py-3 text-gray-700', col.className)}>
                    {col.render
                      ? col.render(row[col.key as keyof T], row)
                      : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
