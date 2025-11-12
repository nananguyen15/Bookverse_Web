package com.swp391.bookverse.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * @Author huangdat
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SeriesResponse {
    Long id;
    String name;
    String description;
    String author;
    String image;
    Boolean active;
}
