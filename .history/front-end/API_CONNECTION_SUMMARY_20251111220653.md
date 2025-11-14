# API Connection Summary - Management Features

## ✅ Hoàn Thành Tất Cả API Endpoints

Đã kết nối đầy đủ BE API với FE cho các management features sau:

---

## 1. 👥 **User Management** (Customer & Staff)

**File**: `src/api/endpoints/users.api.ts`

### Endpoints Đã Implement:

- ✅ `POST /api/users/create` - Tạo user mới (Admin)
- ✅ `POST /api/users/signup` - Sign up customer
- ✅ `GET /api/users` - Lấy tất cả users
- ✅ `GET /api/users/{userId}` - Lấy user theo ID
- ✅ `GET /api/users/myInfo` - Lấy thông tin user hiện tại
- ✅ `PUT /api/users/myInfo` - Cập nhật thông tin user hiện tại
- ✅ `PUT /api/users/update/{userId}` - Cập nhật user
- ✅ `PUT /api/users/change-role/{userId}` - Chuyển đổi role (Customer ↔ Staff)
- ✅ `GET /api/users/customers` - Lấy tất cả customers
- ✅ `GET /api/users/staffs` - Lấy tất cả staffs
- ✅ `GET /api/users/active` - Lấy users active
- ✅ `GET /api/users/inactive` - Lấy users inactive
- ✅ `GET /api/users/is-active/{userId}` - Kiểm tra user có active không
- ✅ `PUT /api/users/active/{userId}` - Activate user
- ✅ `PUT /api/users/inactive/{userId}` - Deactivate user (soft delete)
- ✅ `GET /api/users/id-by-email/{email}` - Lấy userId theo email

### Request/Response Types:

- `User`, `UserCreateRequest`, `UserUpdateRequest`, `SignUpRequest`

---

## 2. 📚 **Book Management**

**File**: `src/api/endpoints/books.api.ts`

### Endpoints Đã Implement:

- ✅ `POST /api/books/create` - Tạo sách mới
- ✅ `GET /api/books` - Lấy tất cả sách
- ✅ `GET /api/books/{bookId}` - Lấy sách theo ID
- ✅ `GET /api/books/active` - Lấy sách active
- ✅ `GET /api/books/inactive` - Lấy sách inactive
- ✅ `GET /api/books/active/search/{title}` - Tìm kiếm sách theo title
- ✅ `GET /api/books/active/sort-by-title` - Sắp xếp theo tên A-Z
- ✅ `GET /api/books/active/sort-by-price-desc` - Sắp xếp giá cao → thấp
- ✅ `GET /api/books/active/sort-by-price-asc` - Sắp xếp giá thấp → cao
- ✅ `GET /api/books/active/sort-by-oldest` - Sắp xếp cũ nhất
- ✅ `GET /api/books/active/sort-by-newest` - Sắp xếp mới nhất
- ✅ `PUT /api/books/update/{bookId}` - Cập nhật sách
- ✅ `PUT /api/books/active/{bookId}` - Activate sách
- ✅ `PUT /api/books/inactive/{bookId}` - Deactivate sách (soft delete)
- ✅ `GET /api/books/active/random` - Lấy sách random (cho homepage)

### Request/Response Types:

- `Book`, `BookCreateRequest`, `BookUpdateRequest`

### Features Hỗ Trợ:

- ✅ Sort theo title, price, publication date
- ✅ Filter theo status (active/inactive)
- ✅ Search theo title (đã normalize: loại bỏ dấu chấm, khoảng trắng thừa)
- ⚠️ **Cần FE xử lý**: Validate stock = 0 → hiển thị "Out of Stock"
- ⚠️ **Cần FE xử lý**: Search theo publisher (có thể filter client-side)
- ⚠️ **Cần FE xử lý**: Hiển thị giá gốc và giá sau promotion

---

## 3. ✍️ **Author Management**

**File**: `src/api/endpoints/authors.api.ts`

### Endpoints Đã Implement:

- ✅ `POST /api/authors/create` - Tạo tác giả mới
- ✅ `GET /api/authors` - Lấy tất cả tác giả
- ✅ `GET /api/authors/{authorId}` - Lấy tác giả theo ID
- ✅ `GET /api/authors/active` - Lấy tác giả active
- ✅ `GET /api/authors/inactive` - Lấy tác giả inactive
- ✅ `GET /api/authors/search/{keyword}` - Tìm kiếm tác giả theo tên
- ✅ `GET /api/authors/{authorId}/books` - Lấy sách của tác giả
- ✅ `PUT /api/authors/update/{authorId}` - Cập nhật tác giả
- ⚠️ `PUT /api/authors/inactive/{authorId}` - Deactivate (chưa có ở BE)
- ⚠️ `PUT /api/authors/active/{authorId}` - Activate (chưa có ở BE)

### Request/Response Types:

- `Author`, `AuthorCreateRequest`, `AuthorUpdateRequest`

### Features Hỗ Trợ:

- ✅ CRUD đầy đủ
- ✅ Search theo name
- ⚠️ **Cần FE xử lý**: Sort theo name (A-Z, Z-A)
- ⚠️ **Cần BE thêm**: Soft delete endpoints (active/inactive)

---

## 4. 🏢 **Publisher Management**

**File**: `src/api/endpoints/publishers.api.ts`

### Endpoints Đã Implement:

- ✅ `POST /api/publishers/create` - Tạo nhà xuất bản mới
- ✅ `GET /api/publishers` - Lấy tất cả nhà xuất bản
- ✅ `GET /api/publishers/{publisherId}` - Lấy nhà xuất bản theo ID
- ✅ `GET /api/publishers/active` - Lấy nhà xuất bản active
- ✅ `GET /api/publishers/inactive` - Lấy nhà xuất bản inactive
- ✅ `PUT /api/publishers/update/{publisherId}` - Cập nhật nhà xuất bản
- ⚠️ `PUT /api/publishers/active/{publisherId}` - Activate (chưa có ở BE)
- ⚠️ `PUT /api/publishers/inactive/{publisherId}` - Deactivate (chưa có ở BE)

### Request/Response Types:

- `Publisher`, `PublisherCreateRequest`, `PublisherUpdateRequest`

### Features Hỗ Trợ:

- ✅ CRUD đầy đủ
- ⚠️ **Cần FE xử lý**: Sort theo name (A-Z, Z-A)
- ⚠️ **Cần FE xử lý**: Search theo name
- ⚠️ **Cần BE thêm**: Soft delete endpoints (active/inactive)

---

## 5. 📂 **Sup-Category Management**

**File**: `src/api/endpoints/categories.api.ts` → `categoriesApi.sup`

### Endpoints Đã Implement:

- ✅ `POST /api/sup-categories/create` - Tạo sup-category mới
- ✅ `GET /api/sup-categories` - Lấy tất cả sup-categories
- ✅ `GET /api/sup-categories/{supCategoryId}` - Lấy sup-category theo ID
- ✅ `GET /api/sup-categories/active` - Lấy sup-categories active
- ✅ `GET /api/sup-categories/inactive` - Lấy sup-categories inactive
- ✅ `GET /api/sup-categories/{supCategoryId}/sub-categories` - Lấy sub-categories
- ✅ `PUT /api/sup-categories/update/{supCategoryId}` - Cập nhật sup-category
- ⚠️ `PUT /api/sup-categories/active/{supCategoryId}` - Activate (chưa có ở BE)
- ⚠️ `PUT /api/sup-categories/inactive/{supCategoryId}` - Deactivate (chưa có ở BE)

### Request/Response Types:

- `SupCategory`, `SupCategoryCreateRequest`, `SupCategoryUpdateRequest`

### Features Hỗ Trợ:

- ✅ CRUD đầy đủ
- ⚠️ **Cần FE xử lý**: Sort A-Z, Z-A
- ⚠️ **Cần FE xử lý**: Book count (đếm số sách thuộc category)
- ⚠️ **Cần FE xử lý**: Search theo name
- ⚠️ **Cần BE thêm**: Soft delete endpoints

---

## 6. 📁 **Sub-Category Management**

**File**: `src/api/endpoints/categories.api.ts` → `categoriesApi.sub`

### Endpoints Đã Implement:

- ✅ `POST /api/sub-categories/create` - Tạo sub-category mới
- ✅ `GET /api/sub-categories` - Lấy tất cả sub-categories
- ✅ `GET /api/sub-categories/{subCategoryId}` - Lấy sub-category theo ID
- ✅ `GET /api/sub-categories/active` - Lấy sub-categories active
- ✅ `GET /api/sub-categories/inactive` - Lấy sub-categories inactive
- ✅ `GET /api/sub-categories/search/{keyword}` - Tìm kiếm sub-category
- ✅ `GET /api/sub-categories/{subCategoryId}/active-books` - Lấy sách của sub-category
- ✅ `PUT /api/sub-categories/ubdate/{subCategoryId}` - Cập nhật (⚠️ typo: "ubdate")
- ⚠️ `PUT /api/sub-categories/active/{subCategoryId}` - Activate (chưa có ở BE)
- ⚠️ `PUT /api/sub-categories/inactive/{subCategoryId}` - Deactivate (chưa có ở BE)

### Request/Response Types:

- `SubCategory`, `SubCategoryCreateRequest`, `SubCategoryUpdateRequest`

### Features Hỗ Trợ:

- ✅ CRUD đầy đủ
- ✅ Search theo keyword
- ✅ Có cột supCategory (thuộc sup-category nào)
- ⚠️ **Cần FE xử lý**: Sort A-Z, Z-A
- ⚠️ **Cần FE xử lý**: Book count
- ⚠️ **Cần BE thêm**: Soft delete endpoints
- ⚠️ **Cần BE sửa**: Endpoint typo "ubdate" → "update"

---

## 🔄 **Series Management**

❌ **ĐÃ BỎ** theo yêu cầu

---

## 📝 **Ghi Chú Quan Trọng**

### 1. Response Format từ BE:

- **Wrapped in ApiResponse**: `GET` endpoints trả về list → `response.data.result`
- **Direct return**: Single item endpoints → `response.data`
- Đã handle đúng trong tất cả API functions

### 2. Soft Delete (Activate/Deactivate):

- ✅ **Có sẵn**: Users, Books
- ⚠️ **Chưa có ở BE**: Authors, Publishers, Categories
- → API đã chuẩn bị sẵn, chờ BE implement

### 3. BE Issues Phát Hiện:

- ⚠️ SubCategory update endpoint có typo: `/ubdate/` thay vì `/update/`
- ⚠️ Một số soft delete endpoints chưa có

### 4. FE Cần Xử Lý (Client-side):

- **Book Management**:
  - Validate stock = 0 → hiển thị "Out of Stock"
  - Search/filter theo publisher name
  - Hiển thị giá gốc + giá sau promotion
- **Author/Publisher/Category Management**:
  - Sort A-Z, Z-A (client-side sort)
  - Book count cho categories
  - Search (có thể client-side filter nếu BE chưa có)

---

## 🎯 **Cách Sử Dụng API**

### Example: User Management

```typescript
import { usersApi } from "@/api";

// Get all customers
const customers = await usersApi.getCustomers();

// Create new user
await usersApi.create({
  username: "newuser",
  email: "user@example.com",
  password: "password123",
  name: "New User",
});

// Change role
await usersApi.changeRole("userId");

// Soft delete
await usersApi.deactivate("userId");

// Restore
await usersApi.activate("userId");
```

### Example: Book Management

```typescript
import { booksApi } from "@/api";

// Get all books sorted by newest
const books = await booksApi.sortByNewest();

// Search books
const results = await booksApi.search("harry potter");

// Create book
await booksApi.create({
  title: "Book Title",
  authorId: 1,
  publisherId: 1,
  categoryId: 1,
  price: 100000,
  stock: 50,
});

// Update book
await booksApi.update(bookId, { price: 120000 });

// Soft delete
await booksApi.deactivate(bookId);
```

### Example: Category Management

```typescript
import { categoriesApi } from "@/api";

// Sup-Categories
const supCategories = await categoriesApi.sup.getAll();
await categoriesApi.sup.create({ name: "Fiction" });
const subs = await categoriesApi.sup.getSubCategories(supId);

// Sub-Categories
const subCategories = await categoriesApi.sub.getAll();
await categoriesApi.sub.create({
  name: "Mystery",
  supCategoryId: 1,
});
const books = await categoriesApi.sub.getActiveBooks(subId);
```

---

## ✅ **Checklist Hoàn Thành**

- [x] Users API - CRUD, search, filter, sort, activate/deactivate
- [x] Books API - CRUD, search, sort, activate/deactivate
- [x] Authors API - CRUD, search (⚠️ chờ BE thêm soft delete)
- [x] Publishers API - CRUD (⚠️ chờ BE thêm soft delete)
- [x] Sup-Categories API - CRUD (⚠️ chờ BE thêm soft delete)
- [x] Sub-Categories API - CRUD, search (⚠️ chờ BE thêm soft delete)
- [x] Tất cả Types đã được tạo
- [x] Không có compile errors
- [x] Tuân thủ BE endpoint structure

---

## 🚀 **Next Steps**

1. ✅ **BE Team**:

   - Thêm soft delete cho Authors, Publishers, Categories
   - Sửa typo endpoint SubCategory: `ubdate` → `update`

2. ✅ **FE Team**:

   - Implement UI components sử dụng các API này
   - Xử lý client-side sorting/filtering nếu cần
   - Validate business logic (stock, pricing, etc.)
   - Test tất cả endpoints

3. ✅ **Testing**:
   - Test CRUD operations
   - Test search & filter
   - Test soft delete & restore
   - Test role change (Customer ↔ Staff)
