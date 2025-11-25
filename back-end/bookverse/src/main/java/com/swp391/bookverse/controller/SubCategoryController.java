package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.SubCategoryCreationRequest;
import com.swp391.bookverse.dto.response.BookResponse;
import com.swp391.bookverse.dto.response.SubCategoryResponse;
import com.swp391.bookverse.service.SubCategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author huangdat
 */
@RestController
@RequestMapping("/api/sub-categories")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class SubCategoryController {
    SubCategoryService subCategoryService;
    @PostMapping("/create")
    public APIResponse<SubCategoryResponse> createSubCategory(@RequestBody SubCategoryCreationRequest request) {
        APIResponse<SubCategoryResponse> response = new APIResponse<>();
        response.setResult(subCategoryService.createSubCategory(request));
        return response;
    }

    @GetMapping
    public APIResponse<List<SubCategoryResponse>> getSubCategories() {
        APIResponse<List<SubCategoryResponse>> response = new APIResponse<>();
        response.setResult(subCategoryService.getSubCategories());
        return response;
    }

    @GetMapping("/{subCategoryId}")
    public APIResponse<SubCategoryResponse> getSubCategoryById(@PathVariable("subCategoryId") Long subCategoryId) {
        APIResponse<SubCategoryResponse> response = new APIResponse<>();
        response.setResult(subCategoryService.getSubCategoryById(subCategoryId));
        return response;
    }

    @GetMapping("/search/{keyword}")
    public APIResponse<List<SubCategoryResponse>> searchSubCategories(@PathVariable("keyword")
            String keyword) {
        APIResponse<List<SubCategoryResponse>> response = new APIResponse<>();
        response.setResult(subCategoryService.searchSubCategories(keyword));
        return response;
    }

    @GetMapping("/{subCategoryId}/active-books")
    public APIResponse<List<BookResponse>> getActiveBooksBySubCategoryId(@PathVariable("subCategoryId") Long subCategoryId) {
        APIResponse<List<BookResponse>> response = new APIResponse<>();
        response.setResult(subCategoryService.getActiveBooksBySubCategoryId(subCategoryId));
        return response;
    }

    @PutMapping("/update/{subCategoryId}")
    public APIResponse<SubCategoryResponse> updateSubCategory(@PathVariable("subCategoryId") Integer subCategoryId, @RequestBody SubCategoryCreationRequest request) {
        APIResponse<SubCategoryResponse> response = new APIResponse<>();
        response.setResult(subCategoryService.updateSubCategory(subCategoryId, request));
        return response;
    }

    @GetMapping("/active")
    public APIResponse<List<SubCategoryResponse>> getActiveSubCategories() {
        APIResponse<List<SubCategoryResponse>> response = new APIResponse<>();
        response.setResult(subCategoryService.getActiveSubCategories());
        return response;
    }

    @GetMapping("/inactive")
    public APIResponse<List<SubCategoryResponse>> getInactiveSubCategories() {
        APIResponse<List<SubCategoryResponse>> response = new APIResponse<>();
        response.setResult(subCategoryService.getInactiveSubCategories());
        return response;
    }

    @PutMapping("/active/{subCategoryId}")
    public APIResponse<SubCategoryResponse> activateSubCategory(@PathVariable("subCategoryId") Integer subCategoryId) {
        APIResponse<SubCategoryResponse> response = new APIResponse<>();
        response.setResult(subCategoryService.activateSubCategory(subCategoryId));
        return response;
    }

    @PutMapping("/inactive/{subCategoryId}")
    public APIResponse<SubCategoryResponse> deactivateSubCategory(@PathVariable("subCategoryId") Integer subCategoryId) {
        APIResponse<SubCategoryResponse> response = new APIResponse<>();
        response.setResult(subCategoryService.deactivateSubCategory(subCategoryId));
        return response;
    }
}
