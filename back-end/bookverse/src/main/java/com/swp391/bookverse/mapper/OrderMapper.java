package com.swp391.bookverse.mapper;

import com.swp391.bookverse.dto.request.OrderCreationRequest;
import com.swp391.bookverse.dto.response.OrderResponse;
import com.swp391.bookverse.entity.Order;
import com.swp391.bookverse.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.username")
    @Mapping(target = "orderItems", source = "orderItems")
    OrderResponse toOrderResponse(Order order);

    @Mapping(target = "bookId", source = "book.id")
    @Mapping(target = "bookTitle", source = "book.title")
    OrderResponse.OrderItemResponse toOrderItemResponse(OrderItem orderItem);
}
