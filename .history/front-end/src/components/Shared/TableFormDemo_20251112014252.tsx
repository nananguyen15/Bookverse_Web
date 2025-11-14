import React, { useState } from 'react';import React, { useState } from 'react';import React, { useState } from 'react';

import { TableForm, TableRow } from './Shared';

import { TableCell, TableCellText, ActionButton, ActionButtonGroup, StatusBadge } from './Shared/Management';import { TableForm, TableRow } from './Shared';import { TableForm, TableRow, TableCell } from './Shared/Table';

import type { TableColumn, SortConfig } from './Shared';

import { TableCell, TableCellText, ActionButton, ActionButtonGroup, StatusBadge } from './Shared/Management';import type { TableColumn, SortConfig } from './Shared/TableForm';

// Sample data

const sampleStaff = [import type { TableColumn, SortConfig } from './Shared';

  {

    id: 1,// Sample data

    username: 'john_doe',

    name: 'John Doe',// Sample dataconst sampleProducts = [

    email: 'john@example.com',

    phone: '+1234567890',const sampleStaff = [  {

    address: '123 Main St, City, Country',

    active: true  {    id: 1,

  },

  {    id: 1,    name: 'Apple MacBook Pro 17"',

    id: 2,

    username: 'jane_smith',    username: 'john_doe',    color: 'Silver',

    name: 'Jane Smith',

    email: 'jane@example.com',    name: 'John Doe',    category: 'Laptop',

    phone: '+0987654321',

    address: '456 Oak Ave, Town, Country',    email: 'john@example.com',    price: 2999

    active: false

  },    phone: '+1234567890',  },

  {

    id: 3,    address: '123 Main St, City, Country',  {

    username: 'bob_wilson',

    name: 'Bob Wilson',    active: true    id: 2,

    email: 'bob@example.com',

    phone: '+1122334455',  },    name: 'Microsoft Surface Pro',

    address: '789 Pine Rd, Village, Country',

    active: true  {    color: 'White',

  }

];    id: 2,    category: 'Laptop PC',



const TableFormDemo: React.FC = () => {    username: 'jane_smith',    price: 1999

  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });

    name: 'Jane Smith',  },

  const columns: TableColumn[] = [

    {    email: 'jane@example.com',  {

      key: 'avatar',

      label: 'Avatar',    phone: '+0987654321',    id: 3,

      sortable: false,

      width: 'w-16'    address: '456 Oak Ave, Town, Country',    name: 'Magic Mouse 2',

    },

    {    active: false    color: 'Black',

      key: 'username',

      label: 'Username',  },    category: 'Accessories',

      sortable: true

    },  {    price: 99

    {

      key: 'name',    id: 3,  }

      label: 'Name',

      sortable: true    username: 'bob_wilson',];

    },

    {    name: 'Bob Wilson',

      key: 'email',

      label: 'Email',    email: 'bob@example.com',const TableFormDemo: React.FC = () => {

      sortable: true

    },    phone: '+1122334455',  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });

    {

      key: 'phone',    address: '789 Pine Rd, Village, Country',

      label: 'Phone',

      sortable: false    active: true  const columns: TableColumn[] = [

    },

    {  }    {

      key: 'address',

      label: 'Address',];      key: 'name',

      sortable: false

    },      label: 'Product name',

    {

      key: 'status',const TableFormDemo: React.FC = () => {      sortable: true

      label: 'Status',

      sortable: false,  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });    },

      align: 'center'

    },    {

    {

      key: 'actions',  const columns: TableColumn[] = [      key: 'color',

      label: 'Actions',

      sortable: false,    {      label: 'Color',

      align: 'center'

    }      key: 'avatar',      sortable: true

  ];

      label: 'Avatar',    },

  const handleSort = (field: string) => {

    setSortConfig(prev => ({      sortable: false,    {

      field,

      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'      width: 'w-16'      key: 'category',

    }));

  };    },      label: 'Category',



  const handleView = (staff: any) => {    {      sortable: true

    alert(`View details for ${staff.name}`);

  };      key: 'username',    },



  const handleEdit = (staff: any) => {      label: 'Username',    {

    alert(`Edit ${staff.name}`);

  };      sortable: true      key: 'price',



  const handleToggleStatus = (staff: any) => {    },      label: 'Price',

    alert(`${staff.active ? 'Deactivate' : 'Activate'} ${staff.name}`);

  };    {      sortable: true,



  const handleChangeRole = (staff: any) => {      key: 'name',      align: 'right'

    alert(`Change role for ${staff.name}`);

  };      label: 'Name',    },



  // Sort staff based on sortConfig      sortable: true    {

  const sortedStaff = [...sampleStaff].sort((a, b) => {

    const aValue = a[sortConfig.field as keyof typeof a];    },      key: 'actions',

    const bValue = b[sortConfig.field as keyof typeof b];

    {      label: 'Actions',

    if (typeof aValue === 'string' && typeof bValue === 'string') {

      const comparison = aValue.localeCompare(bValue);      key: 'email',      sortable: false,

      return sortConfig.order === 'asc' ? comparison : -comparison;

    }      label: 'Email',      align: 'right'



    return 0;      sortable: true    }

  });

    },  ];

  return (

    <div className="p-8">    {

      <h1 className="text-2xl font-bold mb-6">TableForm Demo - Tái sử dụng Components có sẵn</h1>

      <p className="text-gray-600 mb-4">      key: 'phone',  const handleSort = (field: string) => {

        Demo này sử dụng các component có sẵn trong Shared/Management: ActionButton, StatusBadge, TableCell, TableCellText.

        Click vào column headers để sort.      label: 'Phone',    setSortConfig(prev => ({

      </p>

      sortable: false      field,

      <TableForm

        columns={columns}    },      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'

        sortConfig={sortConfig}

        onSort={handleSort}    {    }));

      >

        {sortedStaff.length === 0 ? (      key: 'address',  };

          <TableRow>

            <TableCell colSpan={columns.length} align="center" className="px-6 py-12 text-gray-500">      label: 'Address',

              No staff members found

            </TableCell>      sortable: false  // Sort products based on sortConfig

          </TableRow>

        ) : (    },  const sortedProducts = [...sampleProducts].sort((a, b) => {

          sortedStaff.map((staff) => (

            <TableRow key={staff.id}>    {    const aValue = a[sortConfig.field as keyof typeof a];

              <TableCell>

                <img      key: 'status',    const bValue = b[sortConfig.field as keyof typeof b];

                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.username}`}

                  alt={`${staff.name} avatar`}      label: 'Status',

                  className="object-cover w-10 h-10 border-2 border-gray-200 rounded-full"

                />      sortable: false,    if (typeof aValue === 'string' && typeof bValue === 'string') {

              </TableCell>

              <TableCell>      align: 'center'      const comparison = aValue.localeCompare(bValue);

                <TableCellText className="font-medium">

                  {staff.username}    },      return sortConfig.order === 'asc' ? comparison : -comparison;

                </TableCellText>

              </TableCell>    {    }

              <TableCell>

                <TableCellText>{staff.name}</TableCellText>      key: 'actions',

              </TableCell>

              <TableCell>      label: 'Actions',    if (typeof aValue === 'number' && typeof bValue === 'number') {

                <TableCellText variant="secondary">{staff.email}</TableCellText>

              </TableCell>      sortable: false,      return sortConfig.order === 'asc' ? aValue - bValue : bValue - aValue;

              <TableCell>

                <TableCellText variant="secondary">      align: 'center'    }

                  {staff.phone || '—'}

                </TableCellText>    }

              </TableCell>

              <TableCell>  ];    return 0;

                <TableCellText variant="secondary" className="max-w-xs truncate" title={staff.address}>

                  {staff.address || '—'}  });

                </TableCellText>

              </TableCell>  const handleSort = (field: string) => {

              <TableCell align="center">

                <StatusBadge active={staff.active} />    setSortConfig(prev => ({  return (

              </TableCell>

              <TableCell align="center">      field,    <div className="p-8">

                <ActionButtonGroup>

                  <ActionButton      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'      <h1 className="text-2xl font-bold mb-6">TableForm Demo</h1>

                    icon="view"

                    onClick={() => handleView(staff)}    }));      <p className="text-gray-600 mb-4">

                    title="View Details"

                  />  };        Click on column headers to sort. This demonstrates the sortable table functionality.

                  <ActionButton

                    icon="edit"      </p>

                    onClick={() => handleEdit(staff)}

                    title="Edit"  const handleView = (staff: any) => {

                  />

                  <ActionButton    alert(`View details for ${staff.name}`);      <TableForm

                    icon="role"

                    onClick={() => handleChangeRole(staff)}  };        columns={columns}

                    title="Change Role"

                  />        sortConfig={sortConfig}

                  <ActionButton

                    icon={staff.active ? "deactivate" : "activate"}  const handleEdit = (staff: any) => {        onSort={handleSort}

                    onClick={() => handleToggleStatus(staff)}

                    variant={staff.active ? "danger" : "success"}    alert(`Edit ${staff.name}`);      >

                    title={staff.active ? "Deactivate" : "Activate"}

                  />  };        {sortedProducts.map((product) => (

                </ActionButtonGroup>

              </TableCell>          <TableRow key={product.id}>

            </TableRow>

          ))  const handleToggleStatus = (staff: any) => {            <TableCell>

        )}

      </TableForm>    alert(`${staff.active ? 'Deactivate' : 'Activate'} ${staff.name}`);              <span className="font-medium text-gray-900 dark:text-white">

    </div>

  );  };                {product.name}

};

              </span>

export default TableFormDemo;
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