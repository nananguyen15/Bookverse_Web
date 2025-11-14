# TableForm System - Tái sử dụng Components có sẵn

Hệ thống TableForm được tối ưu hóa để tận dụng các component có sẵn trong `Shared/Management`, giúp tái sử dụng code hiệu quả.

## Components được sử dụng

### Từ Shared/Management (đã có sẵn):
- **`TableHeader`** - Header cho bảng với alignment
- **`TableCell`, `TableCellText`** - Cell và text formatting
- **`ActionButton`, `ActionButtonGroup`** - Buttons với icons và colors
- **`StatusBadge`** - Badge hiển thị trạng thái active/inactive

### Components mới tạo:
- **`TableForm`** - Component chính với sortable headers
- **`TableRow`** - Row wrapper với hover effects

## Cấu trúc Components

### TableForm
```tsx
import { TableForm, TableRow } from '../Shared';
import { TableHeader, TableCell, ActionButton, StatusBadge } from '../Shared/Management';
import type { TableColumn, SortConfig } from '../Shared';

const columns: TableColumn[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true
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

<TableForm columns={columns} sortConfig={sortConfig} onSort={handleSort}>
  <TableRow>
    <TableCell>John Doe</TableCell>
    <TableCell align="center">
      <StatusBadge active={true} />
    </TableCell>
    <TableCell align="center">
      <ActionButton icon="edit" onClick={handleEdit} title="Edit" />
    </TableCell>
  </TableRow>
</TableForm>
```

## Cách áp dụng cho Management Components

### 1. Staff Management
```tsx
import { TableForm, TableRow } from '../Shared';
import { TableHeader, TableCell, TableCellText, ActionButton, ActionButtonGroup, StatusBadge } from '../Shared/Management';

const columns: TableColumn[] = [
  { key: 'avatar', label: 'Avatar', sortable: false, width: 'w-16' },
  { key: 'username', label: 'Username', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone', sortable: false },
  { key: 'address', label: 'Address', sortable: false },
  { key: 'status', label: 'Status', sortable: false, align: 'center' },
  { key: 'actions', label: 'Actions', sortable: false, align: 'center' }
];
```

### 2. Customer Management
```tsx
const columns: TableColumn[] = [
  { key: 'no', label: 'No.', sortable: false, align: 'center', width: 'w-16' },
  { key: 'avatar', label: 'Avatar', sortable: false, width: 'w-20' },
  { key: 'username', label: 'Username', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone', label: 'Phone', sortable: false },
  { key: 'address', label: 'Address', sortable: false },
  { key: 'status', label: 'Status', sortable: false, align: 'center' },
  { key: 'actions', label: 'Actions', sortable: false, align: 'center' }
];
```

### 3. Book Management
```tsx
const columns: TableColumn[] = [
  { key: 'id', label: 'ID', sortable: true, width: 'w-16' },
  { key: 'image', label: 'Image', sortable: false, width: 'w-20' },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'author', label: 'Author', sortable: true },
  { key: 'publisher', label: 'Publisher', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'price', label: 'Price', sortable: true, align: 'right' },
  { key: 'stock', label: 'Stock', sortable: true, align: 'center' },
  { key: 'status', label: 'Status', sortable: false, align: 'center' },
  { key: 'actions', label: 'Actions', sortable: false, align: 'center' }
];
```

## Ưu điểm của cách tiếp cận này

1. **Tái sử dụng code**: Sử dụng lại các component đã có sẵn
2. **Consistent**: Đảm bảo UI consistent across tất cả management pages
3. **Maintainable**: Dễ bảo trì và cập nhật
4. **Type-safe**: Đầy đủ TypeScript support
5. **Flexible**: Có thể tùy chỉnh columns và styling

## Cách migrate từ code cũ

### Từ:
```tsx
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Name
      </th>
      <!-- more headers -->
    </tr>
  </thead>
  <tbody>
    <tr className="bg-white">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        John Doe
      </td>
      <!-- more cells -->
    </tr>
  </tbody>
</table>
```

### Sang:
```tsx
<TableForm columns={columns} sortConfig={sortConfig} onSort={handleSort}>
  <TableRow>
    <TableCell>
      <TableCellText>John Doe</TableCellText>
    </TableCell>
  </TableRow>
</TableForm>
```

## Export Pattern

```tsx
// src/components/Shared/index.ts
export { default as TableForm } from './TableForm';
export { default as TableRow } from './TableRow';
export type { TableColumn, SortConfig } from './TableForm';

// Management components are imported separately
import { TableHeader, TableCell, ActionButton } from '../Shared/Management';
```
</TableForm>
```

### TableRow & TableCell
Components cho rows và cells của bảng.

```tsx
import { TableRow, TableCell } from '../Shared/Table';

<TableRow>
  <TableCell>Name</TableCell>
  <TableCell>Email</TableCell>
  <TableCell align="center">
    <button>Edit</button>
  </TableCell>
</TableRow>
```

## TableColumn Interface

```typescript
interface TableColumn {
  key: string;           // Unique key for the column
  label: string;         // Display label
  sortable?: boolean;    // Whether column can be sorted (default: false)
  align?: 'left' | 'center' | 'right';  // Text alignment (default: 'left')
  width?: string;        // Tailwind width class (e.g., 'w-16')
  className?: string;    // Additional CSS classes
}
```

## SortConfig Interface

```typescript
interface SortConfig {
  field: string;         // Field to sort by
  order: 'asc' | 'desc'; // Sort order
}
```

## Specialized Table Components

### StaffTable
Đã được tạo sẵn cho Staff Management với các cột: Avatar, Username, Name, Email, Phone, Address, Status, Actions.

### CustomerTable
Đã được tạo sẵn cho Customer Management với các cột: No., Avatar, Username, Name, Email, Phone, Address, Status, Actions.

### BookTable
Đã được tạo sẵn cho Book Management với các cột: ID, Image, Title, Author, Publisher, Category, Description, Price, Published Date, Stock, Status, Actions.

## Cách sử dụng trong Management Components

### 1. Import các components cần thiết
```tsx
import { StaffTable } from '../Shared/StaffTable';
import type { SortConfig } from '../Shared/TableForm';
```

### 2. Chuẩn bị data và handlers
```tsx
const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' });

const handleSort = (field: string) => {
  setSortConfig(prev => ({
    field,
    order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
  }));
};
```

### 3. Sử dụng component
```tsx
<StaffTable
  staffs={filteredStaffs}
  sortConfig={sortConfig}
  onSort={handleSort}
  onView={handleView}
  onEdit={handleEdit}
  onToggleStatus={handleToggleStatus}
  onChangeRole={handleChangeRole}
/>
```

## Tùy chỉnh Style

TableForm hỗ trợ tùy chỉnh CSS classes:

```tsx
<TableForm
  columns={columns}
  sortConfig={sortConfig}
  onSort={onSort}
  className="custom-container-class"
  tableClassName="custom-table-class"
  headerClassName="custom-header-class"
  bodyClassName="custom-body-class"
/>
```

## Tạo Table Component mới

Để tạo table component mới cho một entity khác:

1. Tạo file `EntityTable.tsx` trong `src/components/Shared/`
2. Import các components cần thiết
3. Định nghĩa columns array phù hợp với entity
4. Implement các TableCell cho từng cột
5. Export component

## Ví dụ hoàn chỉnh

Xem các file `StaffTable.tsx`, `CustomerTable.tsx`, và `BookTable.tsx` để có ví dụ chi tiết về cách implement table components cho các entities khác nhau.