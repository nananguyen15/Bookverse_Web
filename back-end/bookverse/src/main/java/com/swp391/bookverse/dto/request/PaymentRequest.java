package com.swp391.bookverse.dto.request;

import com.swp391.bookverse.enums.PaymentMethod;
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
public class PaymentRequest {
    PaymentMethod method;
}
