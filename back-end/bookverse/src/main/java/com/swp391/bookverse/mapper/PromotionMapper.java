package com.swp391.bookverse.mapper;

import com.swp391.bookverse.dto.request.PromotionCreationRequest;
import com.swp391.bookverse.dto.request.PromotionUpdateRequest;
import com.swp391.bookverse.dto.response.PromotionResponse;
import com.swp391.bookverse.entity.Promotion;
import org.mapstruct.*;

import java.time.LocalDate;

@Mapper(componentModel = "spring")
public interface PromotionMapper {
    Promotion toPromotion(PromotionCreationRequest request);

    PromotionResponse toPromotionResponse(Promotion promotion);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    void updatePromotion(PromotionUpdateRequest request, @MappingTarget Promotion promotion);

    default Boolean isPromotionActive(Promotion promotion) {
        LocalDate now = LocalDate.now();
        return !now.isBefore(promotion.getStartDate()) && !now.isAfter(promotion.getEndDate());
    }
}
