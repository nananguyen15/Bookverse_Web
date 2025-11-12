# BookVerse Admin Dashboard - Implementation Guide

## ✅ Đã Hoàn Thành

### 1. Admin Layout (`/components/Admin/AdminLayout.tsx`)

- ✅ Sidebar navigation với 10 sections
- ✅ Header với admin account dropdown
- ✅ Responsive design
- ✅ Beige color scheme matching customer side

### 2. Statistics Dashboard (`/components/Admin/StatisticDashboard.tsx`)

- ✅ Summary cards (Total Sales, Orders, Customers, Average Order Value)
- ✅ Growth indicators with up/down arrows
- ✅ Sales Revenue chart (bar chart simulation)
- ✅ Orders by Status pie chart (horizontal bars)
- ✅ Top 5 Products table
- ✅ Time range selector (1W, 1M, 3M, 6M, 1Y)
- ✅ Export Report button (downloads JSON)
- ✅ Data loaded from localStorage

## 📋 Cần Implement (Theo Thứ Tự Ưu Tiên)

### Phase 1: Book Management (CRITICAL)

**File:** `/components/Admin/BookManagement.tsx`

**Features cần có:**

- Table với columns:

  - STT (auto-generated)
  - ID (auto-generated, không edit được)
  - Full Name (title)
  - Author
  - Publisher
  - Published Date
  - Category Tag
  - Promotion (if any)
  - Original Price
  - Discounted Price
  - Description
  - Cover Image
  - Quantity (stock)
  - Status (In Stock / Out of Stock / Archived)
  - Actions (Edit, Delete)

- CRUD Operations:

  - ✅ Create: Modal form với tất cả fields
  - ✅ Read: Table display với pagination
  - ✅ Update: Edit modal
  - ✅ Delete: Confirmation modal

- Filters & Search:

  - Search: Name, Author, Publisher
  - Filter: Category, Author, Publisher, Status
  - Sort: ID (asc/desc), Price, Published Date

- Pagination:
  - Items per page: 10, 20, 50, 100
  - Page numbers với Next/Previous
  - Jump to page input

**Data Structure:**

```typescript
interface Book {
  id: string; // auto-generated
  title: string;
  author: string;
  publisher: string;
  publishedDate: string; // ISO format
  categoryId: string;
  promotionId?: string;
  originalPrice: number;
  discountedPrice?: number;
  description: string;
  coverImage: string; // URL hoặc base64
  stockQuantity: number;
  status: "In Stock" | "Out of Stock" | "Archived";
}
```

### Phase 2: Category Management

**File:** `/components/Admin/CateManagement.tsx`

**Features:**

- Table: ID, Name, Books Count, Description, Actions
- Click on Books Count → Navigate to BookManagement với filter = category
- Add/Edit/Delete categories
- Search & Sort

**Data Structure:**

```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  booksCount: number; // calculated from books array
}
```

### Phase 3: Customer & Staff Management

**Files:**

- `/components/Admin/CustomerManagement.tsx`
- `/components/Admin/StaffManagement.tsx`

**Features:**

- Table: ID, Username, Full Name, Phone, Address, Created At, Avatar, Actions
- Add Customer/Staff: Form kết hợp Personal Info + Address
- Edit: Update user details
- Block: Require reason, send notification to customer
- Delete: Require reason
- Filter: Active, Blocked, Deleted
- Search & Sort

**Data Structure:**

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  address: {
    province: string;
    district: string;
    ward: string;
    street: string;
  };
  avatarUrl?: string;
  role: "customer" | "staff" | "admin";
  status: "active" | "blocked" | "deleted";
  blockReason?: string;
  deleteReason?: string;
  createdAt: string;
}
```

### Phase 4: Order Management

**File:** `/components/Admin/OrderManagement.tsx`

**Features:**

- Table: Order ID, Customer, Email, Date, Total, Payment Method, Status, Actions
- View Details: Modal showing full order info
- Edit Status: Dropdown to change order status
- Cancel/Delete: Require reason + confirmation
- Filter: Status (All, Preparing, Confirmed, Picked up, Delivered, Cancelled)
- Search: Order ID, Customer name, Email
- Sort: Date, Total

### Phase 5: Review Management

**File:** `/components/Admin/ManageReview.tsx`

**Features:**

- Table: #, Customer (link), Product, Review Text, Rating, Date, Actions
- Delete Review: Require reason, send notification to customer
- Filter: Rating (1-5 stars, All)
- Search: Customer name, Product name
- Sort: Date, Rating

**Data Structure:**

```typescript
interface Review {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}
```

### Phase 6: Promotion Management

**File:** `/components/Admin/Promotion.tsx`

**Features:**

- Table: #, Name, Apply To (Category/All), Description, Discount Value, Start Date, End Date, Actions
- Add Promotion: Create notification automatically
- Edit/Delete promotions
- Search & Sort

**Data Structure:**

```typescript
interface Promotion {
  id: string;
  name: string;
  description: string;
  applyTo: "all" | string; // "all" or categoryId
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  active: boolean;
}
```

### Phase 7: Notification Management

**File:** `/components/Admin/Notification.tsx`

**Features:**

- Table: #, Title, Description, Created At
- Auto-created when:
  - New promotion added
  - Customer blocked/deleted
  - Review deleted
- Search & Sort

**Data Structure:**

```typescript
interface AdminNotification {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type: "promotion" | "user_action" | "review_delete";
}
```

### Phase 8: Series Management

**File:** `/components/Admin/SeriesManagement.tsx`

**Features:** Same as Book Management but for Series

### Phase 9: Admin Account

**File:** `/components/Admin/AdminAccount.tsx`

**Features:**

- Edit: Full Name, Username (check unique), Password, Avatar
- No address or phone fields
- Simple form matching customer Profile

## 🎨 UI Components cần tạo

### Reusable Components:

1. **DataTable.tsx** - Generic table component

   - Props: columns, data, pagination, actions
   - Features: Sort, filter, search built-in

2. **Modal.tsx** - Generic modal wrapper

   - Props: isOpen, onClose, title, children
   - Used for Add/Edit/Delete confirmations

3. **DeleteConfirmModal.tsx**

   - Props: onConfirm, onCancel, requireReason
   - Has textarea for reason input

4. **StatusBadge.tsx**

   - Props: status, colorMap
   - Displays colored status pills

5. **Pagination.tsx**
   - Props: currentPage, totalPages, itemsPerPage, onPageChange
   - Includes items-per-page dropdown

## 📦 localStorage Keys

```
- books: Book[]
- series: Series[]
- categories: Category[]
- users: User[] (includes customers, staff, admin)
- orders: Order[]
- reviews: Review[]
- promotions: Promotion[]
- adminNotifications: AdminNotification[]
- adminProfile: { username, fullName, avatarUrl }
```

## 🚀 Next Steps

1. **Implement BookManagement first** - Most critical, has all CRUD patterns
2. **Create reusable components** - DataTable, Modal, Pagination
3. **CategoryManagement** - Links to BookManagement
4. **CustomerManagement** - User management pattern
5. **Continue with remaining sections**

## 💡 Tips

- Sử dụng lại components từ customer side khi có thể (forms, modals)
- localStorage là temporary DB, cần sync với dữ liệu hiện có
- Validation phải giống customer side
- Admin có thể edit/delete mọi thứ nhưng cần confirmation
- Notifications phải tự động tạo khi có actions nhất định

---

**Status:** Admin Layout & Statistics Dashboard hoàn thành ✅
**Next:** BookManagement implementation 🔨
