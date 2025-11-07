package com.swp391.bookverse.mapper;

import com.swp391.bookverse.dto.response.CartItemResponse;
import com.swp391.bookverse.dto.response.CartResponse;
import com.swp391.bookverse.entity.Cart;
import com.swp391.bookverse.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "cartItems", target = "cartItems")
    CartResponse toCartResponse(Cart cart);

    @Mapping(source = "book.id", target = "bookId")
    @Mapping(source = "book.title", target = "bookTitle")
    @Mapping(source = "book.price", target = "price")
    @Mapping(expression = "java(cartItem.getQuantity() * cartItem.getBook().getPrice())", target = "subtotal")
    CartItemResponse toCartItemResponse(CartItem cartItem);
}
