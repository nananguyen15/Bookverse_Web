package com.swp391.bookverse.dto.request;

import com.swp391.bookverse.entity.SupCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class SubCategoryUpdateRequest {
    @NotNull(message = "supCategoryId is required")
    String supCategoryId;

    @NotBlank(message = "name must not be blank")
    @Size(max = 255, message = "name must be at most 255 characters")
    String name;

    @Size(max = 2000, message = "description must be at most 2000 characters")
    String description;

//    Long promotionId;

    @Column(nullable = false)
    Boolean active;

}
