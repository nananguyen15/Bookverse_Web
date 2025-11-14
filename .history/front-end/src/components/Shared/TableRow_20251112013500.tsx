import React from 'react';

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const TableRow: React.FC<TableRowProps> = ({
  children,
  className = "bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200",
  hover = true
}) => {
  return (
    <tr className={`${className} ${hover ? 'hover:bg-gray-50 dark:hover:bg-gray-600' : ''}`}>
      {children}
    </tr>
  );
};

export default TableRow;