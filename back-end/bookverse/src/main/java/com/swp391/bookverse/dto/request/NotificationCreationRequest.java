package com.swp391.bookverse.dto.request;

import com.swp391.bookverse.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationCreationRequest {
    @NotBlank(message = "Content is required")
    String content;

    @NotNull(message = "Type is required")
    NotificationType type;

    String targetUserId; // For personal notifications
}
