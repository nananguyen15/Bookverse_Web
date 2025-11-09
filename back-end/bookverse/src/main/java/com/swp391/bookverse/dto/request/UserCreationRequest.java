package com.swp391.bookverse.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

/**
 * @Author huangdat
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE) // Set default access level for fields to private
public class UserCreationRequest {
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "USERNAME_INVALID") // Only allows letters, numbers, and underscores
    @Size(min = 8, max = 32, message = "USERNAME_INVALID")
    String username;
    // Password must has at least one uppercase letter, one lowercase letter, one digit. Only allows letters, numbers, and underscores
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z0-9_]+$", message = "PASSWORD_INVALID")
    @Size(min = 8, max = 16, message = "PASSWORD_INVALID")
    String password;
    @Email(message = "EMAIL_INVALID")
    String email;

    boolean active;
}
