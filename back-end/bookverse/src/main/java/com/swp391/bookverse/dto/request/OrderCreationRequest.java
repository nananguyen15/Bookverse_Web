package com.swp391.bookverse.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class OrderCreationRequest {
    @NotBlank(message = "Address is required")
    String address;

    // Payment method can be added here if needed
    // private String paymentMethod;
}
