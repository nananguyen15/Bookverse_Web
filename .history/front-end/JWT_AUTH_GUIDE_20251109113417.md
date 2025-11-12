# JWT Authentication & Authorization Guide

## 🎫 Khái Niệm: JWT như "Vé Vào Cửa"

### Ví dụ thực tế:

- **Đăng nhập = Mua vé**: Khi bạn login (username + password), backend trả về JWT token (cái vé)
- **Lưu vé = localStorage**: Bạn giữ vé này trong ví (localStorage) để không phải mua vé mỗi lần
- **Dùng vé = Authorization Header**: Mỗi lần vào cửa (gọi API), bạn đưa vé cho bảo vệ kiểm tra
- **Vé hết hạn = Token expired**: Sau một thời gian, vé hết hạn, phải mua vé mới (login lại)

---

## 🔐 Flow Hoàn Chỉnh

### 1. Sign Up & Verify Email

```
User Sign Up
  → Backend tạo user (active: false)
  → Frontend gửi OTP
  → User verify OTP
  → Backend set active: true
```

### 2. Sign In (Mua Vé)

```
User nhập username/password
  ↓
POST /api/auth/token
  ↓
Backend trả JWT token (cái vé)
  ↓
Frontend lưu token vào localStorage
  ↓
GET /api/users/myInfo (với token)
  ↓
Check user.active === true
  ↓
Save token & user info vào AuthContext
  ↓
Navigate theo role (Admin/Staff/Customer)
```

### 3. Token Verification (Khi Load App)

```
App khởi động / F5 / Reload
  ↓
AuthContext useEffect chạy
  ↓
Lấy token từ localStorage
  ↓
POST /api/auth/introspect { token }
  ↓
Backend kiểm tra token còn hợp lệ không
  ↓
├─ Valid: Lấy user info, maintain login state
└─ Invalid: Xóa token, logout, redirect login
```

### 4. API Calls (Dùng Vé)

```
User gọi bất kỳ API nào
  ↓
API Interceptor tự động thêm:
  Authorization: Bearer {token}
  ↓
Backend verify token
  ↓
├─ Valid: Trả data
└─ Invalid (401): Interceptor xóa token, redirect login
```

---

## 📁 Code Structure

### 1. Types (auth.types.ts)

```typescript
interface IntrospectRequest {
  token: string;
}

interface IntrospectResponse {
  valid: boolean;
}
```

### 2. API Function (auth.api.ts)

```typescript
introspect: async (data: IntrospectRequest): Promise<IntrospectResponse> => {
  const response = await apiClient.post("/auth/introspect", data);
  return response.data.result;
};
```

### 3. Auth Context (AuthContext.tsx)

**Chức năng:**

- ✅ Lưu JWT token vào localStorage
- ✅ Verify token khi app load (introspect)
- ✅ Auto logout nếu token invalid
- ✅ Maintain user info và role
- ✅ Provide login/logout functions

**State:**

```typescript
{
  isAuthenticated: boolean,  // Đã login chưa
  user: User | null,          // Thông tin user
  userRole: string | null,    // Role để phân quyền
  isLoading: boolean          // Đang verify token
}
```

### 4. API Interceptor (client.ts)

**Request Interceptor:**

- Tự động thêm `Authorization: Bearer {token}` cho mọi API call
- Trừ public endpoints (books, categories,...)

**Response Interceptor:**

- Bắt 401 error → Xóa token, redirect to login
- Bắt 403 error → Log forbidden access

### 5. Protected Routes (ProtectedRoute.tsx)

**Component:**

- `<ProtectedRoute>` - Cần login
- `<CustomerRoute>` - Chỉ CUSTOMER
- `<StaffRoute>` - Chỉ STAFF
- `<AdminRoute>` - Chỉ ADMIN
- `<AdminOrStaffRoute>` - ADMIN hoặc STAFF

---

## 🚀 Cách Sử Dụng

### 1. Setup Routes

```tsx
import { ProtectedRoute, AdminRoute, CustomerRoute } from './components/Auth/ProtectedRoute';

// Public routes - Không cần login
<Route path="/" element={<Home />} />
<Route path="/books" element={<Books />} />
<Route path="/signin" element={<SignIn />} />

// Protected routes - Cần login
<Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />

// Role-based routes
<Route path="/admin/*" element={
  <AdminRoute>
    <AdminLayout />
  </AdminRoute>
} />

<Route path="/cart" element={
  <CustomerRoute>
    <Cart />
  </CustomerRoute>
} />
```

### 2. Sử dụng useAuth Hook

```tsx
import { useAuth } from "../contexts/AuthContext";

function MyComponent() {
  const { isAuthenticated, user, userRole, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>Please login</p>;
  }

  return (
    <div>
      <p>Welcome, {user?.username}</p>
      <p>Your role: {userRole}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Conditional Rendering theo Role

```tsx
function Navbar() {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <nav>
      {/* Public links */}
      <Link to="/">Home</Link>
      <Link to="/books">Books</Link>

      {/* Customer only */}
      {isAuthenticated && userRole === "CUSTOMER" && (
        <Link to="/cart">Cart</Link>
      )}

      {/* Admin only */}
      {isAuthenticated && userRole === "ADMIN" && (
        <Link to="/admin">Admin Panel</Link>
      )}

      {/* Staff & Admin */}
      {isAuthenticated && ["ADMIN", "STAFF"].includes(userRole!) && (
        <Link to="/orders">Manage Orders</Link>
      )}
    </nav>
  );
}
```

---

## 🔑 Token Management

### Khi nào token được sử dụng?

1. **Lưu token**: Chỉ khi login thành công
2. **Xóa token**:
   - User click logout
   - Token invalid (introspect failed)
   - 401 error từ API

### Khi nào verify token?

1. **App load/reload**: AuthContext useEffect
2. **Không verify**: Mỗi lần gọi API (backend tự verify)

### Token flow:

```
Login → Save token → App reload → Introspect
  ↓                                    ↓
Store                               Valid?
  ↓                                    ↓
API calls                   Yes → Keep / No → Logout
  ↓
Auto attach Bearer token
```

---

## 🎯 Role-Based Access Control (RBAC)

### Backend Roles:

- `ADMIN`: Quản lý toàn hệ thống
- `STAFF`: Quản lý orders, books, users
- `CUSTOMER`: Mua sách, đặt hàng

### Frontend Protection:

```typescript
// Trong routes
<AdminRoute>        // Chỉ ADMIN
<StaffRoute>        // Chỉ STAFF
<CustomerRoute>     // Chỉ CUSTOMER
<ProtectedRoute>    // Bất kỳ ai đã login

// Trong component
{userRole === 'ADMIN' && <AdminButton />}
{['ADMIN', 'STAFF'].includes(userRole!) && <StaffFeature />}
```

---

## 🛠️ Troubleshooting

### Token luôn invalid sau reload?

- Check localStorage có token không
- Check backend introspect endpoint
- Check token format (Bearer {token})

### 401 error liên tục?

- Token đã expire
- Backend không nhận được token
- Check API interceptor

### Không redirect sau 401?

- Check response interceptor trong client.ts
- Check currentPath logic

### Role-based access không hoạt động?

- Check user.role từ backend
- Check allowedRoles trong ProtectedRoute
- Verify role string matching (case-sensitive)

---

## 📝 Testing Checklist

### Login Flow:

- [ ] Login thành công → Lưu token
- [ ] Login thất bại → Không lưu token
- [ ] User chưa verify → Redirect to verify page

### Token Persistence:

- [ ] Reload page (F5) → Vẫn đăng nhập
- [ ] Đóng tab, mở lại → Vẫn đăng nhập
- [ ] Token expire → Auto logout

### Role-Based Access:

- [ ] CUSTOMER không vào được /admin
- [ ] STAFF không vào được customer-only pages
- [ ] ADMIN vào được mọi nơi

### Logout:

- [ ] Click logout → Xóa token
- [ ] Redirect to home hoặc login
- [ ] Không thể access protected routes

---

## 🔐 Security Best Practices

1. **Never expose sensitive data**:

   - Không log full token ra console (production)
   - Không gửi token qua URL params

2. **Token expiration**:

   - Backend set expiry time hợp lý
   - Frontend handle token refresh (nếu implement)

3. **HTTPS only**:

   - Production phải dùng HTTPS
   - Secure token transmission

4. **XSS Protection**:

   - Sanitize user inputs
   - Use Content Security Policy

5. **CSRF Protection**:
   - Backend implement CSRF tokens
   - SameSite cookies

---

## 📚 Related Files

- `src/contexts/AuthContext.tsx` - JWT management
- `src/api/endpoints/auth.api.ts` - Auth API calls
- `src/api/client.ts` - Interceptors
- `src/components/Auth/ProtectedRoute.tsx` - Route protection
- `src/components/Auth/Unauthorized.tsx` - 403 page
- `src/types/api/auth.types.ts` - TypeScript types

---

## 🎉 Summary

**Luồng chuẩn:**

```
Sign Up → Verify Email → Login → Get JWT → Save Token → Access Protected Routes
```

**Token như vé:**

- Login = Mua vé
- localStorage = Giữ vé
- API calls = Dùng vé
- Introspect = Kiểm tra vé
- Expire/Logout = Vé hết hạn

**Phân quyền:**

- Routes được bảo vệ bằng ProtectedRoute
- UI elements dựa trên userRole
- Backend verify permissions qua JWT claims

Happy coding! 🚀
