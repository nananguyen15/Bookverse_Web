package com.swp391.bookverse.dto.request;

import com.swp391.bookverse.entity.CartItem;
import com.swp391.bookverse.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * @Author huangdat
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE) // Set default access level for fields to private
public class CartCreationRequest {
    String userId;
    List<CartItem> cartItems = new ArrayList<>();
    Boolean active;

}
