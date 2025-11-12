package com.swp391.bookverse.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionResponse {
    Long id;
    String content;
    Integer percentage;
    LocalDate startDate;
    LocalDate endDate;
    Boolean active; // Computed field based on dates
}
