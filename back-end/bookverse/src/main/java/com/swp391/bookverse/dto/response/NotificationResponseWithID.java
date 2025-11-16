package com.swp391.bookverse.dto.response;

import com.swp391.bookverse.enums.NotificationType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponseWithID {
    Long id;
    String userId;
    String content;
    NotificationType type;
    boolean read;
    LocalDateTime createdAt;
}
