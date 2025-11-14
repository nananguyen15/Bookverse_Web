import React, { useState } from 'react';
import { TableForm, TableRow, TableCell } from './Shared/Table';
import type { TableColumn, SortConfig } from './Shared/TableForm';

// Sample data
const sampleProducts = [
  {
    id: 1,
    name: 'Apple MacBook Pro 17"',
    color: 'Silver',
    category: 'Laptop',
    price: 2999
  },
  {
    id: 2,
    name: 'Microsoft Surface Pro',
    color: 'White',
    category: 'Laptop PC',
    price: 1999
  },
  {
    id: 3,
    name: 'Magic Mouse 2',
    color: 'Black',
    category: 'Accessories',
    price: 99
  }
];

const TableFormDemo: React.FC = () => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });

  const columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Product name',
      sortable: true
    },
    {
      key: 'color',
      label: 'Color',
      sortable: true
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      align: 'right'
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right'
    }
  ];

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort products based on sortConfig
  const sortedProducts = [...sampleProducts].sort((a, b) => {
    const aValue = a[sortConfig.field as keyof typeof a];
    const bValue = b[sortConfig.field as keyof typeof b];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortConfig.order === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.order === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">TableForm Demo</h1>
      <p className="text-gray-600 mb-4">
        Click on column headers to sort. This demonstrates the sortable table functionality.
      </p>

      <TableForm
        columns={columns}
        sortConfig={sortConfig}
        onSort={handleSort}
      >
        {sortedProducts.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <span className="font-medium text-gray-900 dark:text-white">
                {product.name}
              </span>
            </TableCell>
            <TableCell>
              {product.color}
            </TableCell>
            <TableCell>
              {product.category}
            </TableCell>
            <TableCell align="right">
              <span className="font-semibold text-green-600">
                ${product.price}
              </span>
            </TableCell>
            <TableCell align="right">
              <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                Edit
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableForm>
    </div>
  );
};

export default TableFormDemo;