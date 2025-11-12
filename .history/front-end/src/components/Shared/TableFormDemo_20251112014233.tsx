import React, { useState } from 'react';import React, { useState } from 'react';

import { TableForm, TableRow } from './Shared';import { TableForm, TableRow, TableCell } from './Shared/Table';

import { TableCell, TableCellText, ActionButton, ActionButtonGroup, StatusBadge } from './Shared/Management';import type { TableColumn, SortConfig } from './Shared/TableForm';

import type { TableColumn, SortConfig } from './Shared';

// Sample data

// Sample dataconst sampleProducts = [

const sampleStaff = [  {

  {    id: 1,

    id: 1,    name: 'Apple MacBook Pro 17"',

    username: 'john_doe',    color: 'Silver',

    name: 'John Doe',    category: 'Laptop',

    email: 'john@example.com',    price: 2999

    phone: '+1234567890',  },

    address: '123 Main St, City, Country',  {

    active: true    id: 2,

  },    name: 'Microsoft Surface Pro',

  {    color: 'White',

    id: 2,    category: 'Laptop PC',

    username: 'jane_smith',    price: 1999

    name: 'Jane Smith',  },

    email: 'jane@example.com',  {

    phone: '+0987654321',    id: 3,

    address: '456 Oak Ave, Town, Country',    name: 'Magic Mouse 2',

    active: false    color: 'Black',

  },    category: 'Accessories',

  {    price: 99

    id: 3,  }

    username: 'bob_wilson',];

    name: 'Bob Wilson',

    email: 'bob@example.com',const TableFormDemo: React.FC = () => {

    phone: '+1122334455',  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });

    address: '789 Pine Rd, Village, Country',

    active: true  const columns: TableColumn[] = [

  }    {

];      key: 'name',

      label: 'Product name',

const TableFormDemo: React.FC = () => {      sortable: true

  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });    },

    {

  const columns: TableColumn[] = [      key: 'color',

    {      label: 'Color',

      key: 'avatar',      sortable: true

      label: 'Avatar',    },

      sortable: false,    {

      width: 'w-16'      key: 'category',

    },      label: 'Category',

    {      sortable: true

      key: 'username',    },

      label: 'Username',    {

      sortable: true      key: 'price',

    },      label: 'Price',

    {      sortable: true,

      key: 'name',      align: 'right'

      label: 'Name',    },

      sortable: true    {

    },      key: 'actions',

    {      label: 'Actions',

      key: 'email',      sortable: false,

      label: 'Email',      align: 'right'

      sortable: true    }

    },  ];

    {

      key: 'phone',  const handleSort = (field: string) => {

      label: 'Phone',    setSortConfig(prev => ({

      sortable: false      field,

    },      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'

    {    }));

      key: 'address',  };

      label: 'Address',

      sortable: false  // Sort products based on sortConfig

    },  const sortedProducts = [...sampleProducts].sort((a, b) => {

    {    const aValue = a[sortConfig.field as keyof typeof a];

      key: 'status',    const bValue = b[sortConfig.field as keyof typeof b];

      label: 'Status',

      sortable: false,    if (typeof aValue === 'string' && typeof bValue === 'string') {

      align: 'center'      const comparison = aValue.localeCompare(bValue);

    },      return sortConfig.order === 'asc' ? comparison : -comparison;

    {    }

      key: 'actions',

      label: 'Actions',    if (typeof aValue === 'number' && typeof bValue === 'number') {

      sortable: false,      return sortConfig.order === 'asc' ? aValue - bValue : bValue - aValue;

      align: 'center'    }

    }

  ];    return 0;

  });

  const handleSort = (field: string) => {

    setSortConfig(prev => ({  return (

      field,    <div className="p-8">

      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'      <h1 className="text-2xl font-bold mb-6">TableForm Demo</h1>

    }));      <p className="text-gray-600 mb-4">

  };        Click on column headers to sort. This demonstrates the sortable table functionality.

      </p>

  const handleView = (staff: any) => {

    alert(`View details for ${staff.name}`);      <TableForm

  };        columns={columns}

        sortConfig={sortConfig}

  const handleEdit = (staff: any) => {        onSort={handleSort}

    alert(`Edit ${staff.name}`);      >

  };        {sortedProducts.map((product) => (

          <TableRow key={product.id}>

  const handleToggleStatus = (staff: any) => {            <TableCell>

    alert(`${staff.active ? 'Deactivate' : 'Activate'} ${staff.name}`);              <span className="font-medium text-gray-900 dark:text-white">

  };                {product.name}

              </span>

  const handleChangeRole = (staff: any) => {            </TableCell>

    alert(`Change role for ${staff.name}`);            <TableCell>

  };              {product.color}

            </TableCell>

  // Sort staff based on sortConfig            <TableCell>

  const sortedStaff = [...sampleStaff].sort((a, b) => {              {product.category}

    const aValue = a[sortConfig.field as keyof typeof a];            </TableCell>

    const bValue = b[sortConfig.field as keyof typeof b];            <TableCell align="right">

              <span className="font-semibold text-green-600">

    if (typeof aValue === 'string' && typeof bValue === 'string') {                ${product.price}

      const comparison = aValue.localeCompare(bValue);              </span>

      return sortConfig.order === 'asc' ? comparison : -comparison;            </TableCell>

    }            <TableCell align="right">

              <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">

    return 0;                Edit

  });              </button>

            </TableCell>

  return (          </TableRow>

    <div className="p-8">        ))}

      <h1 className="text-2xl font-bold mb-6">TableForm Demo - Tái sử dụng Components có sẵn</h1>      </TableForm>

      <p className="text-gray-600 mb-4">    </div>

        Demo này sử dụng các component có sẵn trong Shared/Management: ActionButton, StatusBadge, TableCell, TableCellText.  );

        Click vào column headers để sort.};

      </p>

export default TableFormDemo;
      <TableForm
        columns={columns}
        sortConfig={sortConfig}
        onSort={handleSort}
      >
        {sortedStaff.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} align="center" className="px-6 py-12 text-gray-500">
              No staff members found
            </TableCell>
          </TableRow>
        ) : (
          sortedStaff.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.username}`}
                  alt={`${staff.name} avatar`}
                  className="object-cover w-10 h-10 border-2 border-gray-200 rounded-full"
                />
              </TableCell>
              <TableCell>
                <TableCellText className="font-medium">
                  {staff.username}
                </TableCellText>
              </TableCell>
              <TableCell>
                <TableCellText>{staff.name}</TableCellText>
              </TableCell>
              <TableCell>
                <TableCellText variant="secondary">{staff.email}</TableCellText>
              </TableCell>
              <TableCell>
                <TableCellText variant="secondary">
                  {staff.phone || '—'}
                </TableCellText>
              </TableCell>
              <TableCell>
                <TableCellText variant="secondary" className="max-w-xs truncate" title={staff.address}>
                  {staff.address || '—'}
                </TableCellText>
              </TableCell>
              <TableCell align="center">
                <StatusBadge active={staff.active} />
              </TableCell>
              <TableCell align="center">
                <ActionButtonGroup>
                  <ActionButton
                    icon="view"
                    onClick={() => handleView(staff)}
                    title="View Details"
                  />
                  <ActionButton
                    icon="edit"
                    onClick={() => handleEdit(staff)}
                    title="Edit"
                  />
                  <ActionButton
                    icon="role"
                    onClick={() => handleChangeRole(staff)}
                    title="Change Role"
                  />
                  <ActionButton
                    icon={staff.active ? "deactivate" : "activate"}
                    onClick={() => handleToggleStatus(staff)}
                    variant={staff.active ? "danger" : "success"}
                    title={staff.active ? "Deactivate" : "Activate"}
                  />
                </ActionButtonGroup>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableForm>
    </div>
  );
};

export default TableFormDemo;