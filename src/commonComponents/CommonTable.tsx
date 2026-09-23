import React from 'react';
import { MuiDataGridTable, TableColumn } from './MuiDataGridTable';

export interface ColumnDef<T> {
  id: string;
  header: string;
  field?: keyof T;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
  width?: string | number;
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
  rowHeight?: number;
  minHeight?: number | string;
}

export function CommonTable<T extends Record<string, any>>({
  rows,
  columns,
  getRowId = (row, idx) => (row as any)?.id ?? (row as any)?._id ?? idx,
  loading = false,
  emptyMessage = 'No se encontraron registros',
  error = null,
  showSearch = false,
  searchPlaceholder = 'Buscar registros...',
  title,
  actionsHeader,
  rowHeight = 60,
  minHeight = 420,
}: CommonTableProps<T>) {
  // Convert ColumnDef<T>[] to TableColumn<T>[]
  const gridColumns = React.useMemo<TableColumn<T>[]>(() => {
    return columns.map((col) => {
      const parsedWidth = typeof col.width === 'number' ? col.width : undefined;
      return {
        field: col.id,
        headerName: col.header,
        align: col.align || 'left',
        headerAlign: col.align || 'left',
        width: parsedWidth,
        flex: parsedWidth ? undefined : 1,
        minWidth: 120,
        renderCell: col.render
          ? ({ row }) => col.render!(row)
          : col.field
          ? ({ row }) => (row[col.field!] as any)
          : undefined,
      };
    });
  }, [columns]);

  return (
    <div className="w-full flex flex-col gap-2">
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}
      <MuiDataGridTable<T>
        rows={rows}
        columns={gridColumns}
        getRowId={(row) => getRowId(row, 0)}
        loading={loading}
        header={{
          title,
          showSearch,
          searchPlaceholder,
          toolbarActions: actionsHeader,
        }}
        emptyState={{
          message: emptyMessage,
        }}
        rowHeight={rowHeight}
        minHeight={minHeight}
      />
    </div>
  );
}
