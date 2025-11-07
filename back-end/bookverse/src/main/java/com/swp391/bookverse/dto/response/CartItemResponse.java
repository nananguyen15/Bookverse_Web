package com.swp391.bookverse.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemResponse {
    Long id;
    Long bookId;
    String bookTitle;
    Double price;
    Integer quantity;
    Double subtotal;
}
