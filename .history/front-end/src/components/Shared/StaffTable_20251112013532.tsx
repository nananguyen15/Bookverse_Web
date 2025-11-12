import React from 'react';
import { TableForm, TableRow, TableCell, TableColumn, SortConfig } from '../Shared/Table';
import { User } from '../../types';

interface StaffTableProps {
  staffs: User[];
  sortConfig: SortConfig;
  onSort: (field: string) => void;
  onView: (staff: User) => void;
  onEdit: (staff: User) => void;
  onToggleStatus: (staff: User) => void;
  onChangeRole: (staff: User) => void;
}

const StaffTable: React.FC<StaffTableProps> = ({
  staffs,
  sortConfig,
  onSort,
  onView,
  onEdit,
  onToggleStatus,
  onChangeRole
}) => {
  const columns: TableColumn[] = [
    {
      key: 'avatar',
      label: 'Avatar',
      sortable: false,
      width: 'w-16'
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
    >
      {staffs.length === 0 ? (
        <TableRow hover={false}>
          <TableCell colSpan={columns.length} align="center" className="px-6 py-12 text-gray-500">
            No staff members found
          </TableCell>
        </TableRow>
      ) : (
        staffs.map((staff) => (
          <TableRow key={staff.id}>
            <TableCell>
              <img
                src={staff.image || '/img/avatar/default-avatar.png'}
                alt={`${staff.name} avatar`}
                className="object-cover w-10 h-10 border-2 border-gray-200 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = '/img/avatar/default-avatar.png';
                }}
              />
            </TableCell>
            <TableCell>
              <span className="font-medium text-gray-900 dark:text-white">
                {staff.username}
              </span>
            </TableCell>
            <TableCell>
              {staff.name || '—'}
            </TableCell>
            <TableCell>
              <span className="text-gray-600 dark:text-gray-300">
                {staff.email}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-gray-600 dark:text-gray-300">
                {staff.phone || '—'}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-gray-600 dark:text-gray-300 max-w-xs truncate" title={staff.address}>
                {staff.address || '—'}
              </span>
            </TableCell>
            <TableCell align="center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                staff.active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {staff.active ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
            <TableCell align="center">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => onView(staff)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  title="View Details"
                >
                  👁️
                </button>
                <button
                  onClick={() => onEdit(staff)}
                  className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onChangeRole(staff)}
                  className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                  title="Change Role"
                >
                  🔄
                </button>
                <button
                  onClick={() => onToggleStatus(staff)}
                  className={`${
                    staff.active
                      ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                      : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                  }`}
                  title={staff.active ? 'Deactivate' : 'Activate'}
                >
                  {staff.active ? '🚫' : '✅'}
                </button>
              </div>
            </TableCell>
          </TableRow>
        ))
      )}
    </TableForm>
  );
};

export default StaffTable;