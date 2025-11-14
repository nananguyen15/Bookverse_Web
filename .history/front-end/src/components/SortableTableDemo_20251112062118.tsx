import React, { useState } from 'react';
import {
  SortableTableHeader,
  TableHeader,
  TableCell,
  TableCellText,
  ActionButton,
  ActionButtonGroup,
  StatusBadge
} from './Shared/Management';

interface Product {
  id: number;
  name: string;
  color: string;
  category: string;
  price: number;
  active: boolean;
}

const sampleProducts: Product[] = [
  {
    id: 1,
    name: 'Apple MacBook Pro 17"',
    color: 'Silver',
    category: 'Laptop',
    price: 2999,
    active: true
  },
  {
    id: 2,
    name: 'Microsoft Surface Pro',
    color: 'White',
    category: 'Laptop PC',
    price: 1999,
    active: true
  },
  {
    id: 3,
    name: 'Magic Mouse 2',
    color: 'Black',
    category: 'Accessories',
    price: 99,
    active: false
  }
];

type SortField = 'name' | 'color' | 'category' | 'price';

const SortableTableDemo: React.FC = () => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field as SortField);
      setSortOrder('asc');
    }
  };

  const sortedProducts = [...sampleProducts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-beige-900">Sortable Table Demo</h1>
      <p className="text-gray-600 mb-6">
        Click trên column headers để sort. Sử dụng <code className="bg-gray-100 px-2 py-1 rounded">SortableTableHeader</code> component.
      </p>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <SortableTableHeader
                sortable
                sortKey="name"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              >
                Product name
              </SortableTableHeader>
              <SortableTableHeader
                sortable
                sortKey="color"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              >
                Color
              </SortableTableHeader>
              <SortableTableHeader
                sortable
                sortKey="category"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              >
                Category
              </SortableTableHeader>
              <SortableTableHeader
                sortable
                sortKey="price"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              >
                Price
              </SortableTableHeader>
              <TableHeader align="center">Status</TableHeader>
              <TableHeader align="right">Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map((product) => (
              <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-beige-50">
                <TableCell>
                  <TableCellText className="font-medium">
                    {product.name}
                  </TableCellText>
                </TableCell>
                <TableCell>
                  <TableCellText variant="secondary">
                    {product.color}
                  </TableCellText>
                </TableCell>
                <TableCell>
                  <TableCellText variant="secondary">
                    {product.category}
                  </TableCellText>
                </TableCell>
                <TableCell>
                  <TableCellText className="font-semibold text-green-600">
                    ${product.price}
                  </TableCellText>
                </TableCell>
                <TableCell align="center">
                  <StatusBadge active={product.active} />
                </TableCell>
                <TableCell align="right">
                  <ActionButtonGroup>
                    <ActionButton
                      icon="view"
                      onClick={() => alert(`View ${product.name}`)}
                      title="View"
                    />
                    <ActionButton
                      icon="edit"
                      onClick={() => alert(`Edit ${product.name}`)}
                      title="Edit"
                    />
                  </ActionButtonGroup>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="font-bold text-blue-900 mb-2">Cách sử dụng:</h2>
        <pre className="bg-white p-4 rounded overflow-x-auto text-xs">
          {`import { SortableTableHeader, TableHeader, TableCell } from './Shared/Management';

<SortableTableHeader
  sortable
  sortKey="name"
  currentSortField={sortField}
  currentSortOrder={sortOrder}
  onSort={handleSort}
>
  Product name
</SortableTableHeader>`}
        </pre>
      </div>
    </div>
  );
};

export default SortableTableDemo;