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
@FieldDefaults(level = AccessLevel.PRIVATE) // Set default access level for fields to private
public class IntrospectResponse {
    boolean valid;
    String username;
    String id;
    String role;
    Boolean active;
}
