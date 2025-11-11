package com.swp391.bookverse.dto.response;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * @Author huangdat
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE) // Set default access level for fields to private
public class PublisherResponse {
    Long id;
    @Column(nullable = false)
    String name;
    String address;
    @Column(nullable = false)
    Boolean active;
}
