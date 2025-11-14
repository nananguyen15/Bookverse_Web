import React from 'react';

interface TableCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  colSpan?: number;
}

const TableCell: React.FC<TableCellProps> = ({
  children,
  align = 'left',
  className = "px-6 py-4",
  colSpan
}) => {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : '';

  return (
    <td
      className={`${className} ${alignClass}`}
      colSpan={colSpan}
    >
      {children}
    </td>
  );
};

export default TableCell;