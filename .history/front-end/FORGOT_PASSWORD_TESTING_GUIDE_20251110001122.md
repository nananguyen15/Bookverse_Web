# Forgot Password API Integration - Testing Guide

## ✅ Completed Frontend Changes

### 1. **API Types Updated** (`types/api/auth.types.ts`)

- ✅ Changed `GetUserIdByEmailResponse` from object to string type (backend returns string directly)
- ✅ Added `SendOTPResetPasswordRequest` interface
- ✅ Added `VerifyAndResetPasswordRequest` interface

### 2. **API Endpoints Added** (`api/endpoints/auth.api.ts`)

- ✅ `getUserIdByEmail(email)` - GET /api/users/id-by-email/{email}
- ✅ `sendOTPResetPassword(data)` - POST /api/otp/send-by-email-reset-password
- ✅ `verifyAndResetPassword(data)` - POST /api/otp/verify-reset-password

### 3. **Password Validation Fixed** (`components/Auth/ForgotPassword.tsx`)

- ✅ Updated regex to match backend: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9_]{8,16}$`
- ✅ Requirements: 8-16 chars, at least 1 uppercase, 1 lowercase, 1 digit, only letters/numbers/underscores

### 4. **Component Features**

- ✅ 3-step flow: Email → OTP → New Password
- ✅ 5-minute countdown timer for OTP expiry
- ✅ 45-second resend cooldown
- ✅ Detailed console logging for debugging
- ✅ Proper error handling with user-friendly messages

---

## 🐛 Current Issues

### Issue 1: Backend Returns 500 Error When Sending OTP

**Symptom:** "Internal Server Error" when calling `/api/otp/send-by-email-reset-password`

**Tested with curl:**

```bash
curl -X POST http://localhost:8080/bookverse/api/otp/send-by-email-reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"tuyenntn.dev@gmail.com","tokenType":"RESET_PASSWORD","userId":"f1b86a90-ed10-4197-9737-760366ae4000"}'

# Result: {"code":500,"message":"Internal Server Error"}
```

**Possible Causes:**

1. **Email Service Not Configured** - Gmail SMTP settings missing in `application.yaml`
2. **Database Issue** - OtpToken entity might have constraint violations
3. **Null Pointer** - Some field not initialized properly

**Backend Code Location:**

- Service: `back-end/bookverse/src/main/java/com/swp391/bookverse/service/auth/otp/OtpService.java`
- Method: `sendOtpByEmailResetPassword()` (line 82-119)

**What to Check:**

```yaml
# In back-end/bookverse/src/main/resources/application.yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password # Not regular password! Use App Password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

---

## 📋 Testing Steps (Once Backend is Fixed)

### Step 1: Test Email Lookup

**Endpoint:** GET `/api/users/id-by-email/{email}`

**Test with curl:**

```bash
curl http://localhost:8080/bookverse/api/users/id-by-email/tuyenntn.dev@gmail.com
```

**Expected Response:**

```json
{
  "code": 200,
  "result": "f1b86a90-ed10-4197-9737-760366ae4000"
}
```

✅ **Status:** WORKING

---

### Step 2: Test Send OTP

**Endpoint:** POST `/api/otp/send-by-email-reset-password`

**Request Body:**

```json
{
  "email": "tuyenntn.dev@gmail.com",
  "tokenType": "RESET_PASSWORD",
  "userId": "f1b86a90-ed10-4197-9737-760366ae4000"
}
```

**Expected Response:**

```json
{
  "code": 200,
  "message": "OTP sent to email if it exists."
}
```

❌ **Status:** RETURNS 500 ERROR - NEEDS BACKEND FIX

---

### Step 3: Test Verify OTP and Reset Password

**Endpoint:** POST `/api/otp/verify-reset-password`

**Request Body:**

```json
{
  "userId": "f1b86a90-ed10-4197-9737-760366ae4000",
  "email": "tuyenntn.dev@gmail.com",
  "code": "123456",
  "tokenType": "RESET_PASSWORD",
  "newPassword": "NewPass123"
}
```

**Expected Response:**

```json
{
  "code": 200,
  "message": "Password reset successfully"
}
```

⏳ **Status:** PENDING (Can't test until Step 2 works)

---

## 🔍 Frontend Debug Console Logs

When testing in browser (http://localhost:5175/auth/forgot-password), you should see:

```
🔍 Step 1: Checking email exists... tuyenntn.dev@gmail.com
✓ Step 1: Got userId: f1b86a90-ed10-4197-9737-760366ae4000
📧 Step 2: Sending OTP with data: {email: "tuyenntn.dev@gmail.com", tokenType: "RESET_PASSWORD", userId: "f1b86a90-ed10-4197-9737-760366ae4000"}
❌ Request OTP failed: [Error details]
```

---

## 🛠️ Backend Fixes Needed

### Fix 1: Configure Email Service

**File:** `back-end/bookverse/src/main/resources/application.yaml`

Add or update:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME:your-email@gmail.com}
    password: ${MAIL_PASSWORD:your-app-password}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
          connectiontimeout: 5000
          timeout: 5000
          writetimeout: 5000
```

**Get Gmail App Password:**

1. Go to Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate new password
4. Copy the 16-character password
5. Use this password (not your regular Gmail password)

### Fix 2: Add Exception Handling

**File:** `OtpService.java`

In `sendOtpByEmailResetPassword()`, add better error logging:

```java
try {
    sendEmailVerify(normEmail, code, "Your Bookverse verification code", """
        Your verification code to RESET PASSWORD: %s

        It expires in 5 minutes. If you didn't request this, you can ignore this email.
    """);
} catch (Exception e) {
    // Log the actual error for debugging
    System.err.println("Failed to send email: " + e.getMessage());
    e.printStackTrace();
    throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
}
```

### Fix 3: Check Database Schema

Ensure `otp_tokens` table exists with correct columns:

```sql
CREATE TABLE otp_tokens (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    code VARCHAR(6) NOT NULL,
    token_type VARCHAR(50),
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    used BOOLEAN DEFAULT FALSE
);
```

---

## ✅ Frontend Validation Summary

### Password Rules (Must Match Backend)

- **Length:** 8-16 characters
- **Required:** At least 1 uppercase letter (A-Z)
- **Required:** At least 1 lowercase letter (a-z)
- **Required:** At least 1 digit (0-9)
- **Allowed:** Letters, numbers, and underscores only
- **Examples:**
  - ✅ `Password123`
  - ✅ `MyPass_99`
  - ✅ `Test1234`
  - ❌ `password` (no uppercase, no digit)
  - ❌ `PASSWORD123` (no lowercase)
  - ❌ `Pass@123` (special char @ not allowed, only underscore)

### Email Validation

- ✅ Standard email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

---

## 🚀 Next Steps

1. **Backend Team:** Fix email configuration in `application.yaml`
2. **Backend Team:** Add error logging to see exact error message
3. **Backend Team:** Verify `otp_tokens` table schema
4. **Frontend Team:** Test complete flow once backend returns 200
5. **Both Teams:** Test edge cases:
   - Invalid email
   - Expired OTP (wait 5 minutes)
   - Wrong OTP code
   - Resend OTP
   - Password validation errors

---

## 📝 API Documentation Reference

### Backend Endpoints

| Step | Method | Endpoint                                | Purpose                                   |
| ---- | ------ | --------------------------------------- | ----------------------------------------- |
| 1    | GET    | `/api/users/id-by-email/{email}`        | Check if email exists, get userId         |
| 2    | POST   | `/api/otp/send-by-email-reset-password` | Send OTP to email for password reset      |
| 3    | POST   | `/api/otp/verify-reset-password`        | Verify OTP and reset password in one call |

### Request/Response Examples

See sections above for complete curl examples and expected responses.

---

## 🐞 Known Frontend Issues: FIXED ✅

- ✅ Password validation regex now matches backend exactly
- ✅ getUserIdByEmail parsing corrected (backend returns string, not object)
- ✅ Console logging added for debugging
- ✅ Error messages improved for better UX
- ✅ 5-minute countdown timer working
- ✅ Resend cooldown working

---

## 📞 Contact

If issues persist after email configuration:

1. Check backend console logs for detailed error
2. Verify database connection
3. Test email sending manually with a simple test endpoint
4. Check firewall/antivirus blocking SMTP port 587

---

**Last Updated:** November 9, 2025  
**Frontend Version:** Ready for testing  
**Backend Status:** Needs email configuration fix
