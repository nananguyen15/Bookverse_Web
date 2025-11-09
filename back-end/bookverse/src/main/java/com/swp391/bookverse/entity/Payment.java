package com.swp391.bookverse.entity;

import com.swp391.bookverse.enums.PaymentMethod;
import com.swp391.bookverse.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "enum('COD', 'VNPAY')")
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "enum('PENDING', 'SUCCESS', 'FAILED') default 'PENDING'")
    private PaymentStatus status;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
