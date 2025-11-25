package com.swp391.bookverse.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StatisticOrderStatusResponse {
    Long pending;
    Long confirmed;
    Long processing;
    Long delivering;
    Long delivered;
    Long cancelled;
}
