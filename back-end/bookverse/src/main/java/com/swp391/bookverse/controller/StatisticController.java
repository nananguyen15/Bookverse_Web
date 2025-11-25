package com.swp391.bookverse.controller;


import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.response.*;
import com.swp391.bookverse.service.OrderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @Author huangdat
 */
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class StatisticController {
    OrderService orderService;

    @GetMapping("/top-5-customers")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public APIResponse<List<StatisticUserResponse>> getTop5Customers() {
        APIResponse<List<StatisticUserResponse>> response = new APIResponse<>();
        response.setResult(orderService.getTop5Customers());
        return response;
    }

    @GetMapping("/top-5-books")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public APIResponse<List<StatisticBookResponse>> getTop5Books() {
        APIResponse<List<StatisticBookResponse>> response = new APIResponse<>();
        response.setResult(orderService.getTop5Books());
        return response;
    }

    @GetMapping("/total-customers")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public APIResponse<Long> getTotalCustomers() {
        APIResponse<Long> response = new APIResponse<>();
        response.setResult(orderService.getTotalCustomers());
        return response;
    }

    @GetMapping("/total-orders")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public APIResponse<Long> getTotalOrders() {
        APIResponse<Long> response = new APIResponse<>();
        response.setResult(orderService.getTotalOrders());
        return response;
    }

    @GetMapping("/total-revenue")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public APIResponse<Double> getTotalRevenue() {
        APIResponse<Double> response = new APIResponse<>();
        response.setResult(orderService.getTotalRevenue());
        return response;
    }

    @GetMapping("/sales-over-time")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public APIResponse<List<StatisticSalesOverTimeResponse>> getSalesOverTime() {
        APIResponse<List<StatisticSalesOverTimeResponse>> response = new APIResponse<>();
        response.setResult(orderService.getSalesOverTime());
        return response;
    }

    @GetMapping("/orders-over-time")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public APIResponse<List<StatisticSalesOverTimeResponse>> getOrdersOverTime() {
        APIResponse<List<StatisticSalesOverTimeResponse>> response = new APIResponse<>();
        response.setResult(orderService.getOrdersOverTime());
        return response;
    }

    @GetMapping("/orders-status")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN') or hasAuthority('SCOPE_STAFF')")
    public APIResponse<StatisticOrderStatusResponse> getOrdersStatus() {
        APIResponse<StatisticOrderStatusResponse> response = new APIResponse<>();
        response.setResult(orderService.getOrdersStatus());
        return response;
    }

}
