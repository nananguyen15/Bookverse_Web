# Backend TODO: Reset Password Endpoint

## Overview

Frontend đã implement Forgot Password flow với OTP verification. Tuy nhiên, backend còn thiếu endpoint để reset password sau khi user verify OTP thành công.

## Required Endpoint

### POST /api/auth/reset-password

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newpass123"
}
```

**Logic Flow:**

1. Tìm OTP token trong database theo email
2. Verify OTP:
   - Check OTP code có khớp không
   - Check tokenType = "RESET_PASSWORD"
   - Check OTP chưa được sử dụng (`used = false`)
   - Check OTP chưa hết hạn (`expiresAt > now`)
3. Nếu OTP valid:
   - Tìm user theo email
   - Hash newPassword
   - Update user password
   - Mark OTP as used (`used = true`)
   - Return success response
4. Nếu OTP invalid:
   - Return error response

**Response (Success):**

```json
{
  "code": 200,
  "message": "Password reset successfully",
  "result": null
}
```

**Response (Error):**

```json
{
  "code": 400,
  "message": "Invalid or expired OTP",
  "result": null
}
```

## Implementation Example

### Controller: AuthenticationController.java

```java
@PostMapping("/reset-password")
public APIResponse<Void> resetPassword(@RequestBody ResetPasswordRequest request) {
    authenticationService.resetPassword(request);
    return APIResponse.<Void>builder()
            .code(200)
            .message("Password reset successfully")
            .build();
}
```

### Request DTO: ResetPasswordRequest.java

```java
package com.swp391.bookverse.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ResetPasswordRequest {
    @Email(message = "EMAIL_INVALID")
    String email;

    String otp;

    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "PASSWORD_INVALID")
    @Size(min = 8, max = 16, message = "PASSWORD_INVALID")
    String newPassword;
}
```

### Service: AuthenticationService.java

```java
@Transactional
public void resetPassword(ResetPasswordRequest request) {
    String email = request.getEmail().trim().toLowerCase();

    // Find the latest unused OTP token for this email
    OtpToken otpToken = otpTokenRepository
        .findTopByEmailAndUsedFalseOrderByCreatedAtDesc(email)
        .orElseThrow(() -> new AppException(ErrorCode.OTP_NOT_FOUND));

    // Verify OTP
    if (!otpToken.getTokenType().equals("RESET_PASSWORD")) {
        throw new AppException(ErrorCode.INVALID_TOKEN_TYPE);
    }

    if (Instant.now().isAfter(otpToken.getExpiresAt())) {
        throw new AppException(ErrorCode.OTP_EXPIRED);
    }

    if (!otpToken.getCode().equals(request.getOtp())) {
        throw new AppException(ErrorCode.INVALID_OTP);
    }

    // Find user by email
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

    // Update password
    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);

    // Mark OTP as used
    otpToken.setUsed(true);
    otpTokenRepository.save(otpToken);
}
```

## Additional Notes

### Error Codes to Add (if not exists)

```java
OTP_NOT_FOUND(404, "OTP token not found"),
OTP_EXPIRED(400, "OTP has expired"),
INVALID_OTP(400, "Invalid OTP code"),
INVALID_TOKEN_TYPE(400, "Invalid token type for this operation")
```

### Security Considerations

1. **Rate Limiting**: Consider adding rate limiting to prevent brute force attacks
2. **Email Verification**: Ensure email exists before allowing OTP verification
3. **Audit Log**: Log password reset actions for security audit
4. **Notification**: Consider sending email notification after successful password reset

### Testing Checklist

- [ ] Test với OTP đúng
- [ ] Test với OTP sai
- [ ] Test với OTP đã hết hạn
- [ ] Test với OTP đã được sử dụng
- [ ] Test với email không tồn tại
- [ ] Test với tokenType sai (LOGIN instead of RESET_PASSWORD)
- [ ] Test password validation rules
- [ ] Test concurrent reset attempts

## Integration with Frontend

Frontend đã sẵn sàng và sẽ gọi endpoint này sau khi user:

1. Nhập email và nhận OTP
2. Verify OTP
3. Nhập password mới

Flow hoàn chỉnh từ frontend:

```
Email Input → Send OTP (✅ Working)
  ↓
OTP Input → Verify OTP (✅ Working)
  ↓
New Password Input → Reset Password (❌ Need Backend)
```

Sau khi implement endpoint này, forgot password flow sẽ hoạt động hoàn chỉnh!
