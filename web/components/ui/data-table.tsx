'use client';

import { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Generic DataTable Component
 *
 * A reusable table component with sorting, filtering, and pagination.
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={clients}
 *   columns={[
 *     {
 *       key: 'full_name',
 *       label: 'Cliente',
 *       sortable: true,
 *       render: (client) => (
 *         <div className="flex items-center gap-2">
 *           <span>{client.full_name}</span>
 *         </div>
 *       )
 *     },
 *     {
 *       key: 'email',
 *       label: 'Email',
 *       sortable: true,
 *     }
 *   ]}
 *   onRowClick={(client) => router.push(`/clients/${client.id}`)}
 *   emptyMessage="No hay clientes"
 * />
 * ```
 */

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor?: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  pageSize?: number;
  showPagination?: boolean;
  className?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  mobileRender?: (item: T, index: number) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor = (item, index) => item.id || index.toString(),
  onRowClick,
  emptyMessage = 'No hay datos para mostrar',
  emptyIcon,
  pageSize = 10,
  showPagination = false,
  className = '',
  rowClassName = '',
  mobileRender,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Handle column sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, showPagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Get row class name
  const getRowClassName = (item: T, index: number): string => {
    if (typeof rowClassName === 'function') {
      return rowClassName(item, index);
    }
    return rowClassName;
  };

  // Empty state
  if (data.length === 0) {
    return (
      <div className={`bg-[var(--bg-default)] rounded-xl shadow-md p-12 text-center ${className}`}>
        {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
        <p className="text-[var(--text-secondary)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Desktop Table */}
      <div className="hidden md:block bg-[var(--bg-default)] rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--primary)] bg-opacity-5 border-b border-[var(--primary)] border-opacity-10">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-4 text-left text-sm font-semibold text-[var(--text-primary)] ${
                      column.headerClassName || ''
                    } ${column.sortable ? 'cursor-pointer select-none hover:bg-[var(--primary)] hover:bg-opacity-10' : ''}`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.label}</span>
                      {column.sortable && sortColumn === column.key && (
                        <span>
                          {sortDirection === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--primary)] divide-opacity-5">
              {paginatedData.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  className={`hover:bg-[var(--primary)] hover:bg-opacity-5 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${getRowClassName(item, index)}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-[var(--text-primary)] ${column.className || ''}`}
                    >
                      {column.render ? column.render(item, index) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-4">
        {paginatedData.map((item, index) => (
          <div
            key={keyExtractor(item, index)}
            className={`bg-[var(--bg-default)] rounded-lg shadow-md p-4 ${
              onRowClick ? 'cursor-pointer active:scale-[0.98]' : ''
            } transition-all ${getRowClassName(item, index)}`}
            onClick={() => onRowClick?.(item)}
          >
            {mobileRender ? (
              mobileRender(item, index)
            ) : (
              <div className="space-y-2">
                {columns.map((column) => (
                  <div key={column.key} className="flex justify-between items-start">
                    <span className="text-sm text-[var(--text-secondary)] font-medium">{column.label}:</span>
                    <span className="text-sm text-[var(--text-primary)] text-right">
                      {column.render ? column.render(item, index) : item[column.key]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-default)] rounded-lg shadow-md">
          <div className="text-sm text-[var(--text-secondary)]">
            Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedData.length)} de{' '}
            {sortedData.length} resultados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-[var(--text-secondary)]">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
