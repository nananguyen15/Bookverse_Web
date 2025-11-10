package com.swp391.bookverse.dto.request;

import com.swp391.bookverse.entity.Order;
import com.swp391.bookverse.enums.PaymentMethod;
import com.swp391.bookverse.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * @Author huangdat
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE) // Set default access level for fields to private
public class PaymentCreationRequest {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "enum('COD', 'VNPAY')")
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "enum('PENDING', 'SUCCESS', 'FAILED') default 'PENDING'")
    private PaymentStatus status;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
