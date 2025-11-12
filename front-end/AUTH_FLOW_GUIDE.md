# Hướng Dẫn Authentication Flow với OTP

## Tổng Quan

Hệ thống authentication đã được tích hợp với backend API, sử dụng OTP (One-Time Password) để xác thực email người dùng.

## Flow Chi Tiết

### 1. Sign Up (Đăng Ký)

**File:** `src/components/Auth/SignUp.tsx`

**Quy trình:**

1. User nhập thông tin: username, email, password
2. Frontend gọi API `POST /api/users/signup`
   - Backend tạo user mới với `active: false`
   - Trả về `UserResponse` bao gồm `id`, `username`, `email`
3. Frontend tự động gọi API `POST /api/otp/send-by-email`
   - Gửi OTP đến email của user
   - Backend generate mã OTP 6 chữ số
   - OTP có thời gian hiệu lực 5 phút
4. Navigate đến trang Verify Email với state: `userId`, `email`, `username`

**API Endpoints:**

```typescript
POST /api/users/signup
Body: { username, email, password }
Response: { id, username, email, role, active }

POST /api/otp/send-by-email
Body: { email, userId, tokenType: "LOGIN" }
Response: Success message
```

---

### 2. Verify Email (Xác Thực Email)

**File:** `src/components/Auth/VerifyEmail.tsx`

**Quy trình:**

1. User nhận được email với mã OTP 6 chữ số
2. Nhập mã OTP vào form
3. Frontend gọi API `POST /api/otp/verify`
   - Backend kiểm tra OTP có đúng và còn hiệu lực không
   - Nếu đúng: set user `active: true`
4. Redirect đến trang Sign In

**Tính năng:**

- ⏱️ **Countdown Timer**: Hiển thị thời gian còn lại của OTP (5 phút)
- 🔄 **Resend OTP**: Cho phép gửi lại OTP mới
  - Có cooldown 45 giây giữa các lần gửi
  - Khi resend, timer reset về 5 phút
- ❌ **Error Handling**: Hiển thị lỗi nếu OTP sai hoặc hết hạn

**API Endpoints:**

```typescript
POST /api/otp/verify
Body: { userId, email, code, tokenType: "LOGIN" }
Response: Success message
```

---

### 3. Sign In (Đăng Nhập)

**File:** `src/components/Auth/SignIn.tsx`

**Quy trình:**

1. User nhập username và password
2. Frontend gọi API `POST /api/auth/token`
   - Backend xác thực username/password
   - Trả về JWT token nếu thành công
3. Frontend lưu token vào localStorage
4. Gọi API `GET /api/users/myInfo` để lấy thông tin user
5. **Kiểm tra `active` status:**
   - Nếu `active: false` → User chưa verify email
     - Hiển thị thông báo yêu cầu verify
     - Redirect đến trang Verify Email sau 2 giây
   - Nếu `active: true` → Đăng nhập thành công
     - Redirect dựa trên role (admin/staff/customer)

**API Endpoints:**

```typescript
POST /api/auth/token
Body: { username, password }
Response: { authenticated, token }

GET /api/users/myInfo
Headers: { Authorization: Bearer {token} }
Response: { id, username, email, role, active }
```

---

### 4. Forgot Password (Quên Mật Khẩu)

**File:** `src/components/Auth/ForgotPassword.tsx`

**Quy trình 3 bước:**

#### Bước 1: Nhập Email

1. User nhập email
2. Frontend gọi API `POST /api/otp/send-by-email`
   - Backend gửi OTP đến email (nếu email tồn tại)
   - `tokenType: "RESET_PASSWORD"`
3. Chuyển sang Bước 2

#### Bước 2: Verify OTP

1. User nhập mã OTP 6 chữ số
2. Có thể resend OTP (cooldown 45 giây)
3. Click "Verify Code"
4. Chuyển sang Bước 3

#### Bước 3: Đặt Lại Mật Khẩu

1. User nhập password mới và confirm password
2. Frontend gọi API `POST /api/auth/reset-password`
   - **LƯU Ý:** Endpoint này chưa được implement trong backend
   - Cần backend team implement endpoint này
3. Nếu thành công, redirect đến Sign In

**API Endpoints:**

```typescript
POST /api/otp/send-by-email
Body: { email, tokenType: "RESET_PASSWORD" }
Response: Success message

// TODO: Backend cần implement endpoint này
POST /api/auth/reset-password
Body: { email, otp, newPassword }
Response: Success message
```

---

## Cấu Hình OTP

### Thời gian hiệu lực

- **OTP Expiry**: 5 phút (300 giây)
- **Resend Cooldown**: 45 giây

### Token Types

- `"LOGIN"`: Dùng cho verify email sau sign up
- `"RESET_PASSWORD"`: Dùng cho forgot password flow

---

## Notes Quan Trọng

### 1. OTP Resend Strategy

**Câu hỏi của bạn:** "Chỗ gửi mã resend này tôi không biết nên làm theo thời gian hiệu lực mã otp hay thời gian như nào?"

**Giải pháp đã implement:**

- ✅ **Cooldown Timer**: 45 giây giữa các lần resend
  - Tránh spam requests
  - Backend cũng có rate limiting
- ✅ **OTP Expiry Timer**: 5 phút cho mỗi OTP
  - Hiển thị countdown cho user
  - Khi resend, tạo OTP mới với expiry mới (reset về 5 phút)
- ✅ **User Experience**:
  - Button "Resend" bị disable trong 45 giây đầu
  - Hiển thị countdown: "Resend (wait 45s)"
  - Sau 45 giây, user có thể click resend

### 2. Backend Requirements

**Đã có:**

- ✅ POST `/api/users/signup` - Tạo user mới
- ✅ POST `/api/auth/token` - Đăng nhập
- ✅ GET `/api/users/myInfo` - Lấy thông tin user
- ✅ POST `/api/otp/send-by-email` - Gửi OTP
- ✅ POST `/api/otp/verify` - Verify OTP

**Cần thêm:**

- ❌ POST `/api/auth/reset-password` - Reset password sau verify OTP
  - Input: `{ email, otp, newPassword }`
  - Logic:
    1. Verify OTP một lần nữa
    2. Hash password mới
    3. Update password trong database
    4. Mark OTP as used

### 3. Security Notes

- 🔒 JWT Token được lưu trong localStorage
- 🔒 Token được gửi trong Authorization header cho các API calls
- 🔒 OTP chỉ dùng được 1 lần (backend mark as `used`)
- 🔒 OTP tự động expire sau 5 phút
- 🔒 Rate limiting: 45 giây giữa các lần gửi OTP

---

## Testing Flow

### Test Sign Up Flow:

1. Vào `/signup`
2. Nhập thông tin: username, email, password
3. Submit → Nhận OTP qua email
4. Tự động redirect đến `/verify-email`
5. Nhập OTP → Success
6. Redirect đến `/signin`

### Test Forgot Password Flow:

1. Vào `/signin`
2. Click "Forgot Password?"
3. Nhập email → Nhận OTP
4. Nhập OTP → Success
5. Nhập password mới
6. **NOTE**: Sẽ có error vì backend chưa có endpoint reset-password

### Test Sign In với Unverified User:

1. Sign up một user mới
2. KHÔNG verify email
3. Thử sign in với username/password
4. Backend trả về token nhưng user.active = false
5. Frontend hiển thị message và redirect đến verify email

---

## Code Structure

```
src/
├── api/
│   └── endpoints/
│       └── auth.api.ts          # API functions
├── components/
│   └── Auth/
│       ├── SignUp.tsx            # Sign up form
│       ├── VerifyEmail.tsx       # OTP verification
│       ├── SignIn.tsx            # Sign in form
│       └── ForgotPassword.tsx    # Forgot password flow
├── types/
│   └── api/
│       └── auth.types.ts         # TypeScript types
└── contexts/
    └── AuthContext.tsx           # Auth state management
```

---

## Troubleshooting

### User không nhận được OTP email?

- Check backend logs
- Verify email configuration trong backend
- Check spam folder

### OTP luôn báo "Invalid"?

- Check timezone giữa frontend và backend
- Verify userId được pass đúng
- Check backend logs để xem OTP code

### Resend không hoạt động?

- Check cooldown timer (phải đợi 45 giây)
- Backend có rate limiting, check logs

### Reset password fail?

- Backend chưa có endpoint này
- Cần implement: `POST /api/auth/reset-password`

---

## Next Steps

1. ✅ Test thoroughly với backend
2. ❌ Backend team implement reset-password endpoint
3. ❌ Add loading states và animations
4. ❌ Add email template customization
5. ❌ Consider implementing SMS OTP as alternative
