package com.swp391.bookverse.service;

import com.swp391.bookverse.dto.request.PromotionCreationRequest;
import com.swp391.bookverse.dto.request.PromotionUpdateRequest;
import com.swp391.bookverse.dto.response.PromotionResponse;
import com.swp391.bookverse.dto.response.SubCategoryResponse;
import com.swp391.bookverse.entity.Promotion;
import com.swp391.bookverse.entity.SubCategory;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.mapper.PromotionMapper;
import com.swp391.bookverse.repository.PromotionRepository;
import com.swp391.bookverse.repository.SubCategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class PromotionService {
    PromotionRepository promotionRepository;
    PromotionMapper promotionMapper;
    SubCategoryRepository subCategoryRepository;

    /**
     * Create a new promotion. Only admins can perform this action.
     * @param request
     * @return Created PromotionResponse
     */
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    @Transactional
    public PromotionResponse createPromotion(PromotionCreationRequest request) {
        // validate date range
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);
        }

        // check if the content is unique (ignore case)
        if (promotionRepository.existsByContentIgnoreCase(request.getContent())) {
            throw new AppException(ErrorCode.PROMOTION_CONTENT_EXISTS);
        }

        Promotion promotion = promotionMapper.toPromotion(request);
        return promotionMapper.toPromotionResponse(promotionRepository.save(promotion));
    }

    public PromotionResponse getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        return promotionMapper.toPromotionResponse(promotion);
    }

    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(promotionMapper::toPromotionResponse)
                .toList();
    }

    /**
     * Get all promotion that has "active" field true
     * @return
     */
    public List<PromotionResponse> getActivePromotions() {
        List<Promotion> promotions = promotionRepository.findAll();
        List<PromotionResponse> activePromotions = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (Promotion promotion : promotions) {
            if (!now.isAfter(promotion.getEndDate()) && promotion.getActive()) {
                activePromotions.add(promotionMapper.toPromotionResponse(promotion));
            }
        }

        return activePromotions;
    }

    public List<PromotionResponse> getInactivePromotions() {
        List<Promotion> promotions = promotionRepository.findAll();
        List<PromotionResponse> inactivePromotions = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (Promotion promotion : promotions) {
            if (now.isAfter(promotion.getEndDate()) || !promotion.getActive()) {
                inactivePromotions.add(promotionMapper.toPromotionResponse(promotion));
            }
        }

        return inactivePromotions;
    }

    @Transactional
    public PromotionResponse updatePromotion(Long id, PromotionUpdateRequest request) {
        Promotion existingPromotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        promotionMapper.updatePromotion(request, existingPromotion);

        if (existingPromotion.getEndDate().isBefore(existingPromotion.getStartDate())) {
            throw new AppException(ErrorCode.INVALID_DATE_RANGE);
        }

        return promotionMapper.toPromotionResponse(promotionRepository.save(existingPromotion));
    }

    @Transactional
    public void deletePromotion(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new AppException(ErrorCode.PROMOTION_NOT_FOUND);
        }
        promotionRepository.deleteById(id);
    }

    /**
     * Enable or disable a promotion by its ID based on the boolean parameter.
     * @param id
     * @param b
     * @return Updated PromotionResponse
     */
    @Transactional
    public PromotionResponse changeActiveStatusPromotion(Long id, boolean b) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        promotion.setActive(b);
        return promotionMapper.toPromotionResponse(promotionRepository.save(promotion));
    }


    /**
     * Get all sub-categories that have promotion_id = id.
     */
    public List<SubCategoryResponse> getSubCategoriesByPromotionId(Long id) {
        // check if promotion exists
        promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        // find all sub-categories that have this promotion_id
        List<SubCategory> subCategories = subCategoryRepository.findByPromotionId(id);

        if (subCategories.isEmpty()) {
            throw new AppException(ErrorCode.SUBCATEGORY_NOT_FOUND);
        }

        return subCategories.stream()
                .map(promotionMapper::toSubCategoryResponse)
                .toList();
    }
}
