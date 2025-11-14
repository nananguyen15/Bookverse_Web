package com.swp391.bookverse.dto.request;

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
public class VNPayURLCreationRequest {
    Double amount;
    public Long getAmountInVND() {
        return Math.round(amount * 26355); // Convert USD to VND
    }
}
