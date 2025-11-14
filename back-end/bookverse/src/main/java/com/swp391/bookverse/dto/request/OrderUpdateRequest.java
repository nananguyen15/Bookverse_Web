package com.swp391.bookverse.dto.request;

import com.swp391.bookverse.enums.OrderStatus;
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
public class OrderUpdateRequest {
    OrderStatus status;
    String address;
}
