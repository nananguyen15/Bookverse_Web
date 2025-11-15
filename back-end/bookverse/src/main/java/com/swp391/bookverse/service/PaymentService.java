package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.request.PaymentCreationRequest;
import com.swp391.bookverse.dto.request.PaymentRequest;
import com.swp391.bookverse.dto.response.PaymentResponse;
import com.swp391.bookverse.dto.response.VNPayURLResponse;
import com.swp391.bookverse.entity.Order;
import com.swp391.bookverse.entity.Payment;
import com.swp391.bookverse.enums.OrderStatus;
import com.swp391.bookverse.enums.PaymentMethod;
import com.swp391.bookverse.enums.PaymentStatus;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.repository.OrderRepository;
import com.swp391.bookverse.repository.PaymentRepository;
import com.swp391.bookverse.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Slf4j
public class PaymentService {
    PaymentRepository paymentRepository;
    OrderRepository orderRepository;
    UserRepository userRepository;

    /**
     * Create payment record for an order. Only the current user can create payment for their own order.
     * @param request
     * @return
     */
    @Transactional
    public PaymentResponse createPayment(PaymentCreationRequest request) {
        // Get the username of the currently authenticated user
        var context = SecurityContextHolder.getContext();
        String contextName = context.getAuthentication().getName();
        String currentUserId = userRepository.findByUsername(contextName)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND))
                .getId();

        // check if the current user is the owner of the order
        Order orderCheck = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        String orderUserId = orderCheck.getUser().getId();
        if (!orderUserId.equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        // find order
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Check if payment already exists for this order
        if (paymentRepository.existsByOrderId(request.getOrderId())) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_EXISTS);
        }

        // Validate order status
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException(ErrorCode.ORDER_CANCELLED);
        }

        Payment payment = Payment.builder()
                .order(order)
                .method(request.getMethod())
                .status(PaymentStatus.PENDING)
                // convert to vnd
                .amount(order.getTotalAmount() * 26355)
                .createdAt(LocalDateTime.now())
                .build();

        // If COD, mark as success immediately
        if (request.getMethod() == PaymentMethod.COD) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
            order.setStatus(OrderStatus.PENDING);
        }

        Payment savedPayment = paymentRepository.save(payment);
        orderRepository.save(order);

        log.info("Payment created for order {}: {} - {}", request.getOrderId(), payment.getMethod(), payment.getStatus());

        return PaymentResponse.builder()
                .id(savedPayment.getId())
                .orderId(savedPayment.getOrder().getId())
                .method(savedPayment.getMethod())
                .status(savedPayment.getStatus())
                .amount(savedPayment.getAmount())
                .paidAt(savedPayment.getPaidAt())
                .createdAt(savedPayment.getCreatedAt())
                .build();
    }

    @Transactional
    public PaymentResponse updatePaymentStatus(Long orderId, PaymentStatus status) {
        Payment payment = paymentRepository.findByOrderId(orderId);
        if (payment == null) {
            throw new AppException(ErrorCode.PAYMENT_NOT_FOUND);
        }

        payment.setStatus(status);
        if (status == PaymentStatus.SUCCESS) {
            payment.setPaidAt(LocalDateTime.now());
        }

        Payment updatedPayment = paymentRepository.save(payment);
        log.info("Payment status updated for order {}: {}", orderId, status);

        return PaymentResponse.builder()
                .id(updatedPayment.getId())
                .orderId(updatedPayment.getOrder().getId())
                .method(updatedPayment.getMethod())
                .status(updatedPayment.getStatus())
                .amount(updatedPayment.getAmount())
                .paidAt(updatedPayment.getPaidAt())
                .createdAt(updatedPayment.getCreatedAt())
                .build();
    }

    public PaymentResponse getPaymentByOrderId(Long orderId) {
        // Find payment by order ID
        Payment payment = paymentRepository.findByOrderId(orderId);
        if (payment == null) {
            throw new AppException(ErrorCode.PAYMENT_NOT_FOUND);
        }

        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(payment -> PaymentResponse.builder()
                        .id(payment.getId())
                        .orderId(payment.getOrder().getId())
                        .method(payment.getMethod())
                        .status(payment.getStatus())
                        .amount(payment.getAmount())
                        .paidAt(payment.getPaidAt())
                        .createdAt(payment.getCreatedAt())
                        .build())
                .toList();
    }

    public List<PaymentResponse> getPaymentsByUserId(String userId) {
        // Validate user existence
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        return paymentRepository.findByOrderUserId(userId).stream()
                .map(obj -> {
                    Object[] arr = (Object[]) obj;
                    Payment payment = (Payment) arr[0];
                    return PaymentResponse.builder()
                            .id(payment.getId())
                            .orderId(payment.getOrder().getId())
                            .method(payment.getMethod())
                            .status(payment.getStatus())
                            .amount(payment.getAmount())
                            .paidAt(payment.getPaidAt())
                            .createdAt(payment.getCreatedAt())
                            .build();
                })
                .toList();
    }

    /**
     * Get all payments by status
     * @param status
     * @return
     */
    public List<PaymentResponse> getPaymentsByStatus(PaymentStatus status) {
        return paymentRepository.findByStatus(status).stream()
                .map(obj -> {
                    Object[] arr = (Object[]) obj;
                    Payment payment = (Payment) arr[0];
                    return PaymentResponse.builder()
                            .id(payment.getId())
                            .orderId(payment.getOrder().getId())
                            .method(payment.getMethod())
                            .status(payment.getStatus())
                            .amount(payment.getAmount())
                            .paidAt(payment.getPaidAt())
                            .createdAt(payment.getCreatedAt())
                            .build();
                })
                .toList();
    }

    public PaymentResponse markPaymentAsDone(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        Payment updatedPayment = paymentRepository.save(payment);

        //

        return PaymentResponse.builder()
                .id(updatedPayment.getId())
                .orderId(updatedPayment.getOrder().getId())
                .method(updatedPayment.getMethod())
                .status(updatedPayment.getStatus())
                .amount(updatedPayment.getAmount())
                .paidAt(updatedPayment.getPaidAt())
                .createdAt(updatedPayment.getCreatedAt())
                .build();
    }
}
