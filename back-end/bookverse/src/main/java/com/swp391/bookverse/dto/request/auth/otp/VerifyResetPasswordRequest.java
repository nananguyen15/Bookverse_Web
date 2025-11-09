package com.swp391.bookverse.dto.request.auth.otp;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * @Author huangdat
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE) // Set default access level for fields to private
public class VerifyResetPasswordRequest {
    // cannot be null userId
    @NotNull(message = "USER_ID_REQUIRED")
    String userId;
    @Email(message = "EMAIL_INVALID")
    String email;
    String code;
    String tokenType; // default: LOGIN
    // Password must has at least one uppercase letter, one lowercase letter, one digit. Only allows letters, numbers, and underscores
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9_]+$", message = "PASSWORD_INVALID")
    @Size(min = 8, max = 16, message = "PASSWORD_INVALID")
    String newPassword;
}