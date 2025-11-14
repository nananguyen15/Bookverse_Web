import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

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
  className = "relative overflow-x-auto shadow-md sm:rounded-lg",
  tableClassName = "w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400",
  headerClassName = "text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400",
  bodyClassName = ""
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
                className={`px-6 py-3 ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''} ${column.width ? column.width : ''} ${column.className || ''}`}
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
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

export default TableForm;