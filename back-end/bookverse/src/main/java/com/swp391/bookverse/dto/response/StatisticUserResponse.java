package com.swp391.bookverse.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatisticUserResponse {
    String id;
    String username;
    String name;
    String image;
    Double totalSpent;
}
