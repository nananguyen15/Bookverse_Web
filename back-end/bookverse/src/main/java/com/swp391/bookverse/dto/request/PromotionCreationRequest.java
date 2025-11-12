package com.swp391.bookverse.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionCreationRequest {
    @NotBlank(message = "Content is required")
    @Size(max = 255, message = "Content must not exceed 255 characters")
    String content;

    @Min(value = 0, message = "Percentage must be at least 0")
    @Max(value = 100, message = "Percentage must not exceed 100")
    Integer percentage;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    LocalDate startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    LocalDate endDate;

    @NotNull(message = "Active status is required")
    Boolean active;
}
