# TableForm System

Hệ thống TableForm cung cấp các component tái sử dụng cho việc tạo bảng với tính năng sortable headers, phù hợp cho các trang quản lý (Management).

## Components

### TableForm
Component chính để tạo bảng với headers có thể sort.

```tsx
import { TableForm } from '../Shared/Table';
import type { TableColumn, SortConfig } from '../Shared/TableForm';

const columns: TableColumn[] = [
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
    key: 'actions',
    label: 'Actions',
    sortable: false,
    align: 'center'
  }
];

const sortConfig: SortConfig = { field: 'name', order: 'asc' };

<TableForm
  columns={columns}
  sortConfig={sortConfig}
  onSort={(field) => handleSort(field)}
>
  {/* Table rows */}
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