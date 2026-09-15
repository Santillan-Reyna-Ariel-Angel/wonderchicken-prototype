import React, { useState } from 'react';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  id: string;
  header: string;
  field?: keyof T;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
  width?: string;
}

export interface CommonTableProps<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  getRowId?: (row: T, index: number) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  error?: string | null;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (row: T, query: string) => boolean;
  title?: string;
  actionsHeader?: React.ReactNode;
}

export function CommonTable<T>({
  rows,
  columns,
  getRowId = (_, idx) => idx,
  loading = false,
  emptyMessage = 'No se encontraron registros',
  error = null,
  showSearch = false,
  searchPlaceholder = 'Buscar registros...',
  searchFilter,
  title,
  actionsHeader,
}: CommonTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRows = React.useMemo(() => {
    if (!showSearch || !searchQuery.trim()) return rows;
    if (searchFilter) {
      return rows.filter((r) => searchFilter(r, searchQuery.toLowerCase()));
    }
    // Fallback: search across all string/number fields of row
    return rows.filter((r) =>
      Object.values(r as Record<string, any>).some((val) =>
        String(val ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [rows, showSearch, searchQuery, searchFilter]);

  return (
    <div className="bg-white rounded-xl border border-[#e1e8fd] shadow-xs overflow-hidden flex flex-col w-full">
      {/* Optional Top Search / Actions Header */}
      {(title || showSearch || actionsHeader) && (
        <div className="p-3.5 sm:p-4 bg-[#f9f9ff] border-b border-[#e1e8fd] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {title && (
            <h3 className="font-bold text-xs sm:text-sm text-[#141b2b] uppercase tracking-wide font-mono">
              {title}
            </h3>
          )}

          <div className="flex items-center gap-2 flex-1 justify-end flex-wrap">
            {showSearch && (
              <div className="relative min-w-[200px] max-w-xs w-full">
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#5b403d] text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 bg-white text-xs text-[#141b2b] rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a] transition-all font-sans"
                />
              </div>
            )}
            {actionsHeader}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-600 text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs text-[#141b2b]">
          <thead className="bg-[#f1f3ff] text-[#5b403d] font-mono uppercase tracking-wider border-b border-[#e1e8fd]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{ width: col.width }}
                  className={`py-3 px-3.5 font-bold ${
                    col.align === 'center'
                      ? 'text-center'
                      : col.align === 'right'
                      ? 'text-right'
                      : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f3ff]">
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={`loading-${i}`} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.id} className="py-3 px-3.5">
                      <div className="h-4 bg-[#e1e8fd] rounded-sm w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 px-4 text-center">
                  <EmptyState title={emptyMessage} icon="search_off" />
                </td>
              </tr>
            ) : (
              filteredRows.map((row, idx) => (
                <tr
                  key={getRowId(row, idx)}
                  className="hover:bg-[#f9f9ff] transition-colors"
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === 'center'
                        ? 'text-center'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left';

                    return (
                      <td key={col.id} className={`py-3 px-3.5 ${alignClass}`}>
                        {col.render
                          ? col.render(row)
                          : col.field
                          ? (row[col.field] as any)
                          : null}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer bar */}
      <div className="p-2.5 bg-[#f1f3ff] border-t border-[#e1e8fd] flex items-center justify-between text-[11px] font-mono text-[#5b403d] px-3.5">
        <span>
          {loading
            ? 'Cargando registros...'
            : `Total: ${filteredRows.length} ${
                filteredRows.length === 1 ? 'registro' : 'registros'
              }`}
        </span>
        <span className="hidden sm:inline">Wonder Chicken POS Core</span>
      </div>
    </div>
  );
}
