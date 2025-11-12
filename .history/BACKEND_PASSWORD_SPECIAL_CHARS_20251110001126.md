# Password Special Characters - Backend Constraint

## 🔐 Current Password Rules (Forgot Password Flow)

### Backend Validation Pattern

```java
// File: VerifyResetPasswordRequest.java
@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9_]+$")
@Size(min = 8, max = 16)
```

### Current Requirements

- ✅ **Length:** 8-16 characters
- ✅ **Uppercase:** At least 1 letter (A-Z)
- ✅ **Lowercase:** At least 1 letter (a-z)
- ✅ **Digit:** At least 1 number (0-9)
- ⚠️ **Special Characters:** **ONLY underscore (\_)** is allowed

### Why Only Underscore?

Backend endpoint `/api/otp/verify-reset-password` sử dụng pattern `[a-zA-Z0-9_]+$` - chỉ cho phép:

- Letters (a-z, A-Z)
- Numbers (0-9)
- Underscore (\_)

**Các ký tự như `@, $, !, %, *, ?, &, ., -` KHÔNG được phép!**

---

## 🆚 Comparison with Other Endpoints

### User Update Password (Change Password)

```java
// File: UserUpdateRequest.java
@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,16}$")
```

**Requirements:**

- 8-16 characters
- At least 1 lowercase, 1 uppercase, 1 digit
- **At least 1 special character from: @$!%\*?&**
- Only allows: letters, digits, and @$!%\*?&

### Sign Up Password (Registration)

```java
// File: UserCreationRequest.java
@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9_]+$")
```

Same as Forgot Password - only underscore allowed.

---

## ⚠️ The Problem

### Inconsistency Between Endpoints

| Endpoint        | Special Chars Allowed |
| --------------- | --------------------- |
| Sign Up         | Only `_`              |
| Forgot Password | Only `_`              |
| Change Password | `@$!%*?&` (required!) |

**This creates a security issue:**

- User signs up with password: `MyPass_123` ✅
- User changes password to: `NewPass@456` ✅ (requires special char)
- User forgets password and tries to reset to: `ResetPass@789` ❌ **REJECTED!**
- User can only reset to: `ResetPass_789` ✅

**But now user cannot change password again because Change Password requires @$!%\*?& !**

---

## 🛠️ Recommended Backend Fix

### Option 1: Make All Endpoints Consistent (Recommended)

Update ALL password validation patterns to allow common special characters:

```java
// Use this pattern for ALL password endpoints
@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&._-])[A-Za-z\\d@$!%*?&._-]{8,16}$")
```

**Benefits:**

- ✅ Stronger passwords
- ✅ Consistent across all flows
- ✅ Allows common special chars: `@$!%*?&._-`
- ✅ No user confusion

### Option 2: Remove Special Character Requirement

If you want simpler passwords, remove the requirement from Change Password:

```java
// All endpoints use this simpler pattern
@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9_@$!%*?&.-]{8,16}$")
```

**Benefits:**

- ✅ More flexible
- ❌ Weaker password security
- ✅ Allows special chars but doesn't require them

### Option 3: Keep Current System (Not Recommended)

Keep different rules for different endpoints.

**Issues:**

- ❌ User confusion
- ❌ Potential lockout scenarios
- ❌ Inconsistent security policy

---

## 📝 Files to Update (Backend)

### 1. VerifyResetPasswordRequest.java

**Location:** `back-end/bookverse/src/main/java/com/swp391/bookverse/dto/request/auth/otp/`

**Current:**

```java
@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9_]+$", message = "PASSWORD_INVALID")
```

**Proposed:**

```java
@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&._-])[A-Za-z\\d@$!%*?&._-]{8,16}$", message = "PASSWORD_INVALID")
```

### 2. UserCreationRequest.java

**Location:** `back-end/bookverse/src/main/java/com/swp391/bookverse/dto/request/`

Same update as above.

### 3. ErrorCode.java

**Location:** `back-end/bookverse/src/main/java/com/swp391/bookverse/exception/`

**Current:**

```java
PASSWORD_INVALID(1005, "Password must be 8-16 characters long, including at least one uppercase letter, one lowercase letter, and one digit"),
```

**Proposed:**

```java
PASSWORD_INVALID(1005, "Password must be 8-16 characters long, including at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&._-)"),
```

---

## 🎯 Frontend Updates (After Backend Fix)

Once backend is updated, update frontend validation:

### ForgotPassword.tsx

```typescript
const validatePassword = (password: string) => {
  // Updated to match new backend pattern
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,16}$/;
  return passwordRegex.test(password);
};
```

### Error Message

```typescript
"Password must be 8-16 characters with at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character (@$!%*?&._-)";
```

---

## 📊 Security Considerations

### Password Strength Comparison

**Current (underscore only):**

- `MyPass_123` - Medium strength
- Entropy: ~40 bits
- Time to crack: Hours to days

**With Special Characters:**

- `MyPass@123!` - High strength
- Entropy: ~48 bits
- Time to crack: Months to years

### Recommended Special Characters

```
@ $ ! % * ? & . _ -
```

**Why these characters?**

- ✅ Available on all keyboards
- ✅ Don't interfere with URL encoding
- ✅ Commonly accepted in password fields
- ✅ Easy to type

**Characters to AVOID:**

- ❌ `<` `>` - HTML injection risk
- ❌ `'` `"` - SQL injection risk
- ❌ `` ` `` - Command injection risk
- ❌ `\` `/` - Path traversal risk
- ❌ `|` `&` - Shell command risk

---

## 🚀 Implementation Plan

### Phase 1: Backend (Priority: HIGH)

1. Update all password validation patterns
2. Update error messages
3. Test all password-related endpoints
4. Deploy backend changes

### Phase 2: Frontend (After Backend)

1. Update password regex in all components
2. Update error messages
3. Update password strength indicators
4. Test complete user flows

### Phase 3: Documentation

1. Update API documentation
2. Update user-facing password requirements
3. Add password examples to help text

---

## ✅ Testing Checklist

After backend fix, test these scenarios:

- [ ] Sign up with password containing `@$!%*?&`
- [ ] Reset password with password containing `@$!%*?&`
- [ ] Change password with password containing `@$!%*?&`
- [ ] Try password without special char - should fail
- [ ] Try password with only underscore - should fail (if using Option 1)
- [ ] Try password with multiple special chars - should pass
- [ ] Try password with disallowed char (`<>'"`) - should fail

---

## 📞 Action Required

**Backend Team:** Please review and implement one of the proposed options.

**Recommendation:** **Option 1** - Make all endpoints consistent with required special characters `@$!%*?&._-`

**Rationale:**

- Better security
- Consistent UX
- Industry standard
- OWASP compliant

---

**Current Status:** ⏳ Waiting for backend decision  
**Frontend Status:** ✅ Ready to update once backend is fixed  
**Last Updated:** November 9, 2025
