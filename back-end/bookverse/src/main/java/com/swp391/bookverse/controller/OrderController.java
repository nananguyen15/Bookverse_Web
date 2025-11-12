package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.OrderCreationRequest;
import com.swp391.bookverse.dto.request.OrderUpdateRequest;
import com.swp391.bookverse.dto.response.OrderResponse;
import com.swp391.bookverse.enums.OrderStatus;
import com.swp391.bookverse.service.OrderService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author: huangdat
 */
@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/api/orders")
public class OrderController {
    OrderService orderService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('SCOPE_CUSTOMER')")
    public APIResponse<OrderResponse> createOrder(@Valid @RequestBody OrderCreationRequest request) {
        return APIResponse.<OrderResponse>builder()
                .code(200)
                .result(orderService.createOrder(request))
                .build();
    }

    @GetMapping("/{id}")
    public APIResponse<OrderResponse> getOrderById(@PathVariable Long id) {
        return APIResponse.<OrderResponse>builder()
                .code(200)
                .result(orderService.getOrderById(id))
                .build();
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public APIResponse<List<OrderResponse>> getAllOrders() {
        return APIResponse.<List<OrderResponse>>builder()
                .code(200)
                .result(orderService.getAllOrders())
                .build();
    }

    @GetMapping("/myOrders")
    public APIResponse<List<OrderResponse>> getMyOrders() {
        return APIResponse.<List<OrderResponse>>builder()
                .code(200)
                .result(orderService.getMyOrders())
                .build();
    }

    /**
     * Get orders by status
     * @param status
     * @return list of orders with the given status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public APIResponse<List<OrderResponse>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return APIResponse.<List<OrderResponse>>builder()
                .code(200)
                .result(orderService.getOrdersByStatus(status))
                .build();
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public APIResponse<OrderResponse> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody OrderUpdateRequest request) {
        return APIResponse.<OrderResponse>builder()
                .code(200)
                .result(orderService.updateOrder(id, request))
                .build();
    }

    @PutMapping("/myOrders/cancel/{id}")
    public APIResponse<OrderResponse> CancelMyOrder(
            @PathVariable Long id) {
        return APIResponse.<OrderResponse>builder()
                .code(200)
                .result(orderService.cancelMyOrder(id))
                .build();
    }
}
