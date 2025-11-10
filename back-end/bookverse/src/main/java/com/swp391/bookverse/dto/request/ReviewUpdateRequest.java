package com.swp391.bookverse.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewUpdateRequest {
    @NotBlank(message = "Comment must not be blank")
    String comment;
}
