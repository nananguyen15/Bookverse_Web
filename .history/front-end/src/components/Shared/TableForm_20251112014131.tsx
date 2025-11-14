import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { TableHeader, TableCell, TableCellText, ActionButton, ActionButtonGroup, StatusBadge } from './Management';
import type { ActionType } from './Management';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

interface TableFormProps {
  columns: TableColumn[];
  sortConfig?: SortConfig;
  onSort?: (field: string) => void;
  children: React.ReactNode;
  className?: string;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

const TableForm: React.FC<TableFormProps> = ({
  columns,
  sortConfig,
  onSort,
  children,
  className = "overflow-x-auto bg-white rounded-lg shadow",
  tableClassName = "min-w-full divide-y divide-gray-200",
  headerClassName = "bg-beige-100",
  bodyClassName = "bg-white divide-y divide-gray-200"
}) => {
  const handleSort = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey);
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.field !== columnKey) {
      return <FaSort className="w-3 h-3 ms-1.5 opacity-50" />;
    }

    return sortConfig.order === 'asc'
      ? <FaSortUp className="w-3 h-3 ms-1.5" />
      : <FaSortDown className="w-3 h-3 ms-1.5" />;
  };

  return (
    <div className={className}>
      <table className={tableClassName}>
        <thead className={headerClassName}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-6 py-3 text-xs font-medium tracking-wider uppercase text-beige-700 ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'} ${column.width ? column.width : ''} ${column.className || ''}`}
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center hover:text-beige-900 transition-colors"
                  >
                    {column.label}
                    {getSortIcon(column.key)}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={bodyClassName}>
          {children}
        </tbody>
      </table>
    </div>
  );
};

// Re-export components for convenience
export { TableHeader, TableCell, TableCellText, ActionButton, ActionButtonGroup, StatusBadge };
export type { ActionType };

export default TableForm;