package com.swp391.bookverse.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {
    Long id;
    String userId;
    Long bookId;
    String comment;
    LocalDateTime createdAt;
}
