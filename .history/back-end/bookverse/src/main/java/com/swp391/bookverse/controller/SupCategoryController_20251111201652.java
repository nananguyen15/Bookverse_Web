package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.SupCategoryCreationRequest;
import com.swp391.bookverse.dto.response.SubCategoryResponse;
import com.swp391.bookverse.dto.response.SupCategoryResponse;
import com.swp391.bookverse.entity.SupCategory;
import com.swp391.bookverse.service.SupCategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author huangdat
 */
@RestController
@RequestMapping("/api/sup-categories")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SupCategoryController {
    SupCategoryService supCategoryService;
    @PostMapping("/create")
    public APIResponse<SupCategoryResponse> createSupCategory(@RequestBody SupCategoryCreationRequest request) {
        APIResponse<SupCategoryResponse> response = new APIResponse<>();
        response.setResult(supCategoryService.createSupCategory(request));
        return response;
    }

    @GetMapping
    public APIResponse<List<SupCategoryResponse>> getSupCategories() {
        APIResponse<List<SupCategoryResponse>> response = new APIResponse<>();
        response.setResult(supCategoryService.getSupCategories());
        return response;
    }

    @GetMapping("/{supCategoryId}")
    public APIResponse<SupCategoryResponse> getSupCategoryById(@PathVariable("supCategoryId") Integer supCategoryId) {
        APIResponse<SupCategoryResponse> response = new APIResponse<>();
        response.setResult(supCategoryService.getSupCategoryById(supCategoryId));
        return response;
    }

    @GetMapping("/{supCategoryId}/sub-categories")
    public APIResponse<List<SubCategoryResponse>> getSubCategoriesBySupCategoryId(@PathVariable("supCategoryId") Integer supCategoryId) {
        APIResponse<List<SubCategoryResponse>> response = new APIResponse<>();
        response.setResult(supCategoryService.getSubCategoriesBySupCategoryId(supCategoryId));
        return response;
    }

    @PutMapping("/update/{supCategoryId}")
    public APIResponse<SupCategoryResponse> updateSupCategory(@PathVariable("supCategoryId") Integer supCategoryId, @RequestBody SupCategoryCreationRequest request) {
        APIResponse<SupCategoryResponse> response = new APIResponse<>();
        response.setResult(supCategoryService.updateSupCategory(supCategoryId, request));
        return response;
    }

    @GetMapping("/active")
    public APIResponse<List<SupCategoryResponse>> getActiveSupCategories() {
        APIResponse<List<SupCategoryResponse>> response = new APIResponse<>();
        response.setResult(supCategoryService.getActiveSupCategories());
        return response;
    }

    @GetMapping("/inactive")
    public APIResponse<List<SupCategoryResponse>> getInactiveSupCategories() {
        APIResponse<List<SupCategoryResponse>> response = new APIResponse<>();
        response.setResult(supCategoryService.getInactiveSupCategories());
        return response;
    }

    @PutMapping("/active/{supCategoryId}")
    public APIResponse<SupCategoryResponse> activateSupCategory(@PathVariable("supCategoryId") Integer supCategoryId) {
        APIResponse<SupCategoryResponse> response = new APIResponse<>();
        response.setResult(supCategoryService.activateSupCategory(supCategoryId));
        return response;
    }

    @PutMapping("/inactive/{supCategoryId}")
    public APIResponse<SupCategoryResponse> deactivateSupCategory(@PathVariable("supCategoryId") Integer supCategoryId) {
        APIResponse<SupCategoryResponse> response = new APIResponse<>();
        response.setResult(supCategoryService.deactivateSupCategory(supCategoryId));
        return response;
    }

}
