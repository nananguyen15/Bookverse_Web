import React from 'react';

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const TableRow: React.FC<TableRowProps> = ({
  children,
  className = "bg-white",
  hover = true
}) => {
  return (
    <tr className={`${className} ${hover ? 'hover:bg-beige-50' : ''} transition-colors`}>
      {children}
    </tr>
  );
};

export default TableRow;