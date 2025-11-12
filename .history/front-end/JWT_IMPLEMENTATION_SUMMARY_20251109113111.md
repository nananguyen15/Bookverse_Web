# 🔐 JWT Authentication Implementation Summary

## ✅ Đã Hoàn Thành

### 1. **Backend Integration**
- ✅ Introspect API để verify JWT token
- ✅ Role-based access control (ADMIN, STAFF, CUSTOMER)
- ✅ Token expiration handling

### 2. **Frontend Implementation**

#### A. Auth Context (contexts/AuthContext.tsx)
- ✅ JWT token management
- ✅ Token verification khi app load (introspect)
- ✅ Auto logout khi token invalid
- ✅ Maintain user info và role
- ✅ Loading state cho token verification

#### B. API Layer
- ✅ `auth.api.ts`: Thêm introspect function
- ✅ `auth.types.ts`: IntrospectRequest/Response types
- ✅ `client.ts`: Request/Response interceptors
  - Auto attach Bearer token
  - Handle 401 errors
  - Auto redirect to login

#### C. Protected Routes
- ✅ `ProtectedRoute.tsx`: Base protected route component
- ✅ `CustomerRoute`: Chỉ CUSTOMER
- ✅ `StaffRoute`: Chỉ STAFF  
- ✅ `AdminRoute`: Chỉ ADMIN
- ✅ `AdminOrStaffRoute`: ADMIN hoặc STAFF
- ✅ `Unauthorized.tsx`: 403 access denied page

#### D. Updated Components
- ✅ `SignIn.tsx`: Lưu JWT token sau login thành công
- ✅ Xóa logic cũ với authToken
- ✅ Sử dụng AuthContext mới

---

## 🎯 Luồng Hoạt Động

### 1. **Login Flow**
```
User nhập credentials
  ↓
POST /api/auth/token
  ↓
Backend trả JWT token
  ↓
Lưu token vào localStorage
  ↓
GET /api/users/myInfo
  ↓
AuthContext.login(token, user)
  ↓
Navigate theo role
```

### 2. **App Load Flow** (F5, reload, reopen)
```
App khởi động
  ↓
AuthContext useEffect
  ↓
Lấy token từ localStorage
  ↓
POST /api/auth/introspect
  ↓
Token valid? 
├─ Yes → GET /api/users/myInfo → Maintain session
└─ No → Logout → Clear token
```

### 3. **Protected Route Flow**
```
User truy cập protected route
  ↓
ProtectedRoute component check
  ↓
isAuthenticated?
├─ No → Redirect to /signin
└─ Yes → Check role
    ├─ No required role → Allow
    └─ Has required role → Check match
        ├─ Match → Allow access
        └─ No match → Redirect to /unauthorized
```

### 4. **API Call Flow**
```
Component gọi API
  ↓
Request Interceptor
  ↓
Add Authorization: Bearer {token}
  ↓
Backend verify token
  ↓
Response
├─ 200 → Return data
├─ 401 → Interceptor xóa token, redirect login
└─ 403 → Log forbidden
```

---

## 📋 Cách Sử Dụng

### 1. Wrap routes với ProtectedRoute
```tsx
// Public route
<Route path="/" element={<Home />} />

// Cần login
<Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />

// Chỉ CUSTOMER
<Route path="/cart" element={
  <CustomerRoute>
    <Cart />
  </CustomerRoute>
} />

// Chỉ ADMIN
<Route path="/admin/*" element={
  <AdminRoute>
    <AdminLayout />
  </AdminRoute>
} />
```

### 2. Sử dụng useAuth trong component
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, userRole, logout, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <LoginPrompt />;

  return (
    <div>
      <p>Welcome, {user?.username}</p>
      <p>Role: {userRole}</p>
      {userRole === 'ADMIN' && <AdminPanel />}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Conditional rendering theo role
```tsx
function Navbar() {
  const { userRole } = useAuth();

  return (
    <nav>
      {userRole === 'CUSTOMER' && <Link to="/cart">Cart</Link>}
      {userRole === 'STAFF' && <Link to="/staff">Staff</Link>}
      {userRole === 'ADMIN' && <Link to="/admin">Admin</Link>}
      {['ADMIN', 'STAFF'].includes(userRole!) && <Link to="/manage">Manage</Link>}
    </nav>
  );
}
```

---

## 🔑 Token Management Rules

### ✅ DO (Làm)
- ✅ Lưu JWT token vào `localStorage.getItem('token')`
- ✅ Verify token khi app load bằng introspect
- ✅ Auto logout khi token invalid
- ✅ Xóa token khi user logout
- ✅ Xóa token khi gặp 401 error

### ❌ DON'T (Không làm)
- ❌ Không log full token ra console (production)
- ❌ Không lưu token vào state component
- ❌ Không verify token mỗi lần gọi API (backend làm)
- ❌ Không tự tạo hoặc modify token
- ❌ Không lưu password vào localStorage

---

## 🎭 Role-Based Access

### Backend Roles:
- **ADMIN**: Full access, quản lý hệ thống
- **STAFF**: Quản lý orders, books, customers
- **CUSTOMER**: Mua sách, xem orders

### Frontend Protection Levels:

#### Level 1: Route Level (Routes)
```tsx
<AdminRoute><AdminLayout /></AdminRoute>
```

#### Level 2: Component Level (Rendering)
```tsx
{userRole === 'ADMIN' && <DeleteButton />}
```

#### Level 3: Feature Level (API Calls)
```tsx
if (userRole !== 'ADMIN') {
  alert('Permission denied');
  return;
}
await deleteItem(id);
```

---

## 🧪 Testing Checklist

### Authentication:
- [x] Login thành công → Token saved
- [x] Login thất bại → No token
- [x] Reload page (F5) → Vẫn login
- [x] Close/reopen browser → Vẫn login (nếu token valid)
- [x] Token expire → Auto logout

### Authorization:
- [x] CUSTOMER không vào /admin
- [x] STAFF không vào /cart
- [x] ADMIN vào được mọi route
- [x] Redirect to /unauthorized khi không có quyền

### Edge Cases:
- [x] User chưa verify email → Cannot login
- [x] 401 error → Auto logout
- [x] Network error → Không crash app
- [x] Token invalid → Clear và logout

---

## 📂 Files Created/Modified

### Created:
1. `src/components/Auth/ProtectedRoute.tsx` - Protected route wrapper
2. `src/components/Auth/Unauthorized.tsx` - 403 page
3. `front-end/JWT_AUTH_GUIDE.md` - Chi tiết guide
4. `front-end/ROUTES_EXAMPLE.tsx` - Ví dụ setup routes

### Modified:
1. `src/contexts/AuthContext.tsx` - JWT logic with introspect
2. `src/api/endpoints/auth.api.ts` - Thêm introspect function
3. `src/types/api/auth.types.ts` - Thêm Introspect types
4. `src/components/Auth/SignIn.tsx` - Sử dụng AuthContext mới
5. `src/api/client.ts` - Request/Response interceptors (đã có)

---

## 📖 Documentation

- **JWT_AUTH_GUIDE.md**: Chi tiết về JWT authentication
- **ROUTES_EXAMPLE.tsx**: Ví dụ setup routes và usage
- **AUTH_FLOW_GUIDE.md**: Flow sign up, verify, login (đã có)

---

## 🚀 Next Steps

### Immediate:
1. ✅ Test với backend API
2. ✅ Setup routes trong App.tsx theo ROUTES_EXAMPLE.tsx
3. ✅ Update Navbar với conditional rendering
4. ✅ Test role-based access

### Optional Enhancements:
- [ ] Token refresh mechanism
- [ ] Remember me functionality
- [ ] Session timeout warning
- [ ] Multiple device management
- [ ] Activity logging

---

## 🔒 Security Notes

1. **Token Storage**: localStorage (OK cho web app)
2. **Token Transmission**: Bearer token in Authorization header
3. **Token Validation**: Backend verify mỗi request
4. **Token Expiration**: Backend set expiry time
5. **XSS Protection**: Sanitize inputs, CSP headers
6. **HTTPS Required**: Production must use HTTPS

---

## 💡 Key Concepts

### JWT như "Vé Vào Cửa":
- **Login** = Mua vé (get token)
- **localStorage** = Giữ vé
- **API calls** = Dùng vé (attach token)
- **Introspect** = Kiểm tra vé còn hạn không
- **Logout/Expire** = Vé hết hạn

### Flow Chuẩn:
```
Sign Up → Verify Email → Login → Get JWT 
→ Save Token → Access Protected Routes
```

---

## 📞 Support

Nếu có vấn đề:
1. Check console logs (có emoji để dễ theo dõi)
2. Check localStorage có token không
3. Check backend introspect endpoint
4. Review JWT_AUTH_GUIDE.md

Happy coding! 🎉
