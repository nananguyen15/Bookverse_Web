package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.PromotionCreationRequest;
import com.swp391.bookverse.dto.request.PromotionUpdateRequest;
import com.swp391.bookverse.dto.response.PromotionResponse;
import com.swp391.bookverse.dto.response.SubCategoryResponse;
import com.swp391.bookverse.service.PromotionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author huangdat
 */
@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class PromotionController {
    PromotionService promotionService;

    @PostMapping("/create")
    public APIResponse<PromotionResponse> createPromotion(@Valid @RequestBody PromotionCreationRequest request) {
        return APIResponse.<PromotionResponse>builder()
                .result(promotionService.createPromotion(request))
                .build();
    }

    @GetMapping("/{id}")
    public APIResponse<PromotionResponse> getPromotionById(@PathVariable Long id) {
        return APIResponse.<PromotionResponse>builder()
                .result(promotionService.getPromotionById(id))
                .build();
    }

    @GetMapping
    public APIResponse<List<PromotionResponse>> getAllPromotions() {
        return APIResponse.<List<PromotionResponse>>builder()
                .code(200)
                .result(promotionService.getAllPromotions())
                .build();
    }

    @GetMapping("/active")
    public APIResponse<List<PromotionResponse>> getActivePromotions() {
        return APIResponse.<List<PromotionResponse>>builder()
                .result(promotionService.getActivePromotions())
                .build();
    }

    @GetMapping("/inactive")
    public APIResponse<List<PromotionResponse>> getInactivePromotions() {
        return APIResponse.<List<PromotionResponse>>builder()
                .result(promotionService.getInactivePromotions())
                .build();
    }

    @PutMapping("/update/{id}")
    public APIResponse<PromotionResponse> updatePromotion(
            @PathVariable Long id,
            @Valid @RequestBody PromotionUpdateRequest request) {
        return APIResponse.<PromotionResponse>builder()
                .result(promotionService.updatePromotion(id, request))
                .build();
    }

    @PutMapping("/active/{id}")
    public APIResponse<PromotionResponse> togglePromotionActiveStatus(@PathVariable Long id) {
        return APIResponse.<PromotionResponse>builder()
                .result(promotionService.changeActiveStatusPromotion(id, true))
                .build();
    }

    @PutMapping("/inactive/{id}")
    public APIResponse<PromotionResponse> togglePromotionInactiveStatus(@PathVariable Long id) {
        return APIResponse.<PromotionResponse>builder()
                .result(promotionService.changeActiveStatusPromotion(id, false))
                .build();
    }

    /**
     * Get all sub-categories that have active promotions
     */
    @GetMapping("/{id}/sub-categories")
    public APIResponse<List<SubCategoryResponse>> getSubCategoriesByPromotionId(@PathVariable Long id) {
        return APIResponse.<List<SubCategoryResponse>>builder()
                .result(promotionService.getSubCategoriesByPromotionId(id))
                .build();
    }
}
