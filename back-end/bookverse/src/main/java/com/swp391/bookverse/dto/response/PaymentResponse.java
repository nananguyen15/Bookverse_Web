package com.swp391.bookverse.dto.response;

import com.swp391.bookverse.enums.PaymentMethod;
import com.swp391.bookverse.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    Long id;
    Long orderId;
    PaymentMethod method;
    PaymentStatus status;
    Double amount;
    LocalDateTime paidAt;
    LocalDateTime createdAt;
}
