import React from 'react';
import { TableForm, TableRow, TableCell } from '../Shared/Table';
import type { TableColumn, SortConfig } from '../Shared/TableForm';
import type { User } from '../../types/api/user.types';

interface CustomerTableProps {
  customers: User[];
  sortConfig: SortConfig;
  onSort: (field: string) => void;
  onView: (customer: User) => void;
  onEdit: (customer: User) => void;
  onToggleStatus: (customer: User) => void;
  currentPage: number;
  itemsPerPage: number;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  sortConfig,
  onSort,
  onView,
  onEdit,
  onToggleStatus,
  currentPage,
  itemsPerPage
}) => {
  const columns: TableColumn[] = [
    {
      key: 'no',
      label: 'No.',
      sortable: false,
      align: 'center',
      width: 'w-16'
    },
    {
      key: 'avatar',
      label: 'Avatar',
      sortable: false,
      width: 'w-20'
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false
    },
    {
      key: 'address',
      label: 'Address',
      sortable: false
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

  return (
    <TableForm
      columns={columns}
      sortConfig={sortConfig}
      onSort={onSort}
      tableClassName="w-full"
      headerClassName="bg-beige-100"
      bodyClassName="bg-white divide-y divide-gray-200"
    >
      {customers.length === 0 ? (
        <TableRow hover={false} className="bg-white">
          <TableCell colSpan={columns.length} align="center" className="px-6 py-12 text-gray-500">
            No customers found
          </TableCell>
        </TableRow>
      ) : (
        customers.map((customer, index) => (
          <TableRow key={customer.id} className="bg-white hover:bg-beige-50">
            <TableCell align="center">
              <span className="font-semibold text-gray-700">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </span>
            </TableCell>
            <TableCell>
              <img
                src={customer.image || '/img/avatar/default-avatar.png'}
                alt={`${customer.name} avatar`}
                className="object-cover w-12 h-12 border-2 border-gray-200 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = '/img/avatar/default-avatar.png';
                }}
              />
            </TableCell>
            <TableCell>
              <span className="font-medium text-gray-900">
                {customer.username}
              </span>
            </TableCell>
            <TableCell>
              {customer.name || '—'}
            </TableCell>
            <TableCell>
              <span className="text-gray-600">
                {customer.email}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-gray-600">
                {customer.phone || '—'}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-gray-600 max-w-xs truncate" title={customer.address}>
                {customer.address || '—'}
              </span>
            </TableCell>
            <TableCell align="center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                customer.active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {customer.active ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
            <TableCell align="center">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => onView(customer)}
                  className="text-blue-600 hover:text-blue-900"
                  title="View Details"
                >
                  👁️
                </button>
                <button
                  onClick={() => onEdit(customer)}
                  className="text-yellow-600 hover:text-yellow-900"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onToggleStatus(customer)}
                  className={`${
                    customer.active
                      ? 'text-red-600 hover:text-red-900'
                      : 'text-green-600 hover:text-green-900'
                  }`}
                  title={customer.active ? 'Deactivate' : 'Activate'}
                >
                  {customer.active ? '🚫' : '✅'}
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableForm>
  );
};

export default CustomerTable;