package com.swp391.bookverse.dto.response;

import com.swp391.bookverse.enums.OrderStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private String userId;
    private String userName;
    private OrderStatus status;
    private Double totalAmount;
    private String address;
    private LocalDateTime createdAt;
    private Boolean active;
    private List<OrderItemResponse> orderItems;
    private PaymentResponse payment;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long bookId;
        private String bookTitle;
        private Integer quantity;
        private Double price;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentResponse {
        private Long id;
        private String method;
        private String status;
        private Double amount;
        private LocalDateTime paidAt;
    }
}
