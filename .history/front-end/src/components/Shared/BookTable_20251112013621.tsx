import React from 'react';
import { TableForm, TableRow, TableCell } from '../Shared/Table';
import type { TableColumn, SortConfig } from '../Shared/TableForm';
import type { Book } from '../../types/api/book.types';

interface BookTableProps {
  books: Book[];
  sortConfig: SortConfig;
  onSort: (field: string) => void;
  onView: (book: Book) => void;
  onEdit: (book: Book) => void;
  onToggleStatus: (book: Book) => void;
}

const BookTable: React.FC<BookTableProps> = ({
  books,
  sortConfig,
  onSort,
  onView,
  onEdit,
  onToggleStatus
}) => {
  const columns: TableColumn[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: 'w-16'
    },
    {
      key: 'image',
      label: 'Image',
      sortable: false,
      width: 'w-20'
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true
    },
    {
      key: 'author',
      label: 'Author',
      sortable: true
    },
    {
      key: 'publisher',
      label: 'Publisher',
      sortable: true
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      align: 'right'
    },
    {
      key: 'publishedDate',
      label: 'Published Date',
      sortable: true
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      align: 'center'
    },
    {
      key: 'status',
      label: 'Status',
      sortable: false,
      align: 'center'
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'center'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <TableForm
      columns={columns}
      sortConfig={sortConfig}
      onSort={onSort}
      tableClassName="w-full text-sm"
      headerClassName="text-xs text-gray-700 uppercase bg-gray-50"
      bodyClassName="bg-white divide-y divide-gray-200"
    >
      {books.length === 0 ? (
        <TableRow hover={false} className="bg-white">
          <TableCell colSpan={columns.length} align="center" className="px-6 py-12 text-gray-500">
            No books found
          </TableCell>
        </TableRow>
      ) : (
        books.map((book) => (
          <TableRow key={book.id} className="bg-white hover:bg-gray-50">
            <TableCell>
              <span className="font-mono text-sm text-gray-600">
                {book.id}
              </span>
            </TableCell>
            <TableCell>
              <img
                src={book.image || '/img/book/default-book.png'}
                alt={`${book.title} cover`}
                className="object-cover w-12 h-16 border border-gray-200 rounded"
                onError={(e) => {
                  e.currentTarget.src = '/img/book/default-book.png';
                }}
              />
            </TableCell>
            <TableCell>
              <div className="max-w-xs">
                <span className="font-medium text-gray-900 truncate block" title={book.title}>
                  {book.title}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-gray-700">
                {book.author?.name || 'Unknown Author'}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-gray-700">
                {book.publisher?.name || 'Unknown Publisher'}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-gray-700">
                {book.subCategory?.name || 'Uncategorized'}
              </span>
            </TableCell>
            <TableCell>
              <div className="max-w-xs">
                <span className="text-gray-600 truncate block" title={book.description}>
                  {book.description || 'No description'}
                </span>
              </div>
            </TableCell>
            <TableCell align="right">
              <span className="font-semibold text-green-600">
                {formatPrice(book.price)}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-gray-600">
                {formatDate(book.publishedDate)}
              </span>
            </TableCell>
            <TableCell align="center">
              <span className={`font-medium ${
                book.stock > 10 ? 'text-green-600' :
                book.stock > 0 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {book.stock}
              </span>
            </TableCell>
            <TableCell align="center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                book.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {book.active ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
            <TableCell align="center">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => onView(book)}
                  className="text-blue-600 hover:text-blue-900"
                  title="View Details"
                >
                  👁️
                </button>
                <button
                  onClick={() => onEdit(book)}
                  className="text-yellow-600 hover:text-yellow-900"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onToggleStatus(book)}
                  className={`${
                    book.active
                      ? 'text-red-600 hover:text-red-900'
                      : 'text-green-600 hover:text-green-900'
                  }`}
                  title={book.active ? 'Deactivate' : 'Activate'}
                >
                  {book.active ? '🚫' : '✅'}
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableForm>
  );
};

export default BookTable;