package com.swp391.bookverse.dto.request;

import jakarta.validation.constraints.Positive;
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
public class CartItemUpdateRequest {
    Long bookId;
    // cannot be null, must be greater than 0
    @Positive(message = "Quantity must be greater than 0")
    Integer quantity;
}
