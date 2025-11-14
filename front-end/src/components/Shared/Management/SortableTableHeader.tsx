import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

interface SortableTableHeaderProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortKey?: string;
  currentSortField?: string;
  currentSortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function SortableTableHeader({
  children,
  align = 'left',
  sortable = false,
  sortKey,
  currentSortField,
  currentSortOrder,
  onSort
}: SortableTableHeaderProps) {
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[align];

  const getSortIcon = () => {
    if (!sortKey || !currentSortField) return <FaSort className="w-3 h-3 ms-1.5 opacity-50" />;

    if (currentSortField !== sortKey) {
      return <FaSort className="w-3 h-3 ms-1.5 opacity-50" />;
    }

    return currentSortOrder === 'asc'
      ? <FaSortUp className="w-3 h-3 ms-1.5 text-beige-700" />
      : <FaSortDown className="w-3 h-3 ms-1.5 text-beige-700" />;
  };

  const handleClick = () => {
    if (sortable && sortKey && onSort) {
      onSort(sortKey);
    }
  };

  return (
    <th className={`px-6 py-3 text-xs font-medium tracking-wider uppercase text-beige-700 ${alignmentClass}`}>
      {sortable ? (
        <button
          onClick={handleClick}
          className="flex items-center hover:text-beige-900 transition-colors focus:outline-none"
        >
          {children}
          {getSortIcon()}
        </button>
      ) : (
        children
      )}
    </th>
  );
}
