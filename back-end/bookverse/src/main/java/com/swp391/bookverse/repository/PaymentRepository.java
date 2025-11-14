package com.swp391.bookverse.repository;

import com.swp391.bookverse.entity.Payment;
import com.swp391.bookverse.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByOrderId(Long orderId);

    Collection<Object> findByOrderUserId(String userId);

    Collection<Object> findByStatus(PaymentStatus status);

    Payment findByOrderId(Long orderId);
}
