package com.swp391.bookverse.service;


import com.swp391.bookverse.dto.request.SupCategoryCreationRequest;
import com.swp391.bookverse.dto.response.SubCategoryResponse;
import com.swp391.bookverse.dto.response.SupCategoryResponse;
import com.swp391.bookverse.entity.SubCategory;
import com.swp391.bookverse.entity.SupCategory;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.mapper.SupCategoryMapper;
import com.swp391.bookverse.repository.SubCategoryRepository;
import com.swp391.bookverse.repository.SupCategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @Author huangdat
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SupCategoryService {
    SupCategoryRepository supCategoryRepository;
    SupCategoryMapper supCategoryMapper;
    SubCategoryRepository subCategoryRepository;

    public SupCategoryResponse createSupCategory(SupCategoryCreationRequest request) {
        // check if sup category name already exists
        if(supCategoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new AppException(ErrorCode.SUP_CATEGORY_EXISTS);
        }
        // map request to entity and save to repository
        SupCategory supCategory = supCategoryMapper.toSupCategory(request);
        SupCategory savedSupCategory = supCategoryRepository.save(supCategory);
        // map saved entity to response and return
        return supCategoryMapper.toSupCategoryResponse(savedSupCategory);
    }

    public List<SupCategoryResponse> getSupCategories() {
        // check if there are any sup categories stored in DB
        if(supCategoryRepository.count() == 0) {
            throw new AppException(ErrorCode.NO_SUP_CATEGORIES_STORED);
        }
        // map list of SupCategory to list of SupCategoryResponse
        List<SupCategory> supCategories = supCategoryRepository.findAll();
        return supCategories.stream()
                .map(supCategoryMapper::toSupCategoryResponse)
                .toList();
    }

    public List<SubCategoryResponse> getSubCategoriesBySupCategoryId(Integer supCategoryId) {
        // find sup category by id or throw exception if not found
        SupCategory supCategory = supCategoryRepository.findById(supCategoryId)
                .orElseThrow(() -> new AppException(ErrorCode.SUP_CATEGORY_NOT_FOUND));
        // get sub categories by sup category
        List<SubCategory> subCategories = subCategoryRepository.findBySupCategory(supCategory);
        // map list of SubCategory to list of SubCategoryResponse
        return subCategories.stream()
                .map(subCategory -> new SubCategoryResponse(
                        subCategory.getId(),
                        subCategory.getSupCategory().getId(),
                        subCategory.getName(),
                        subCategory.getDescription(),
                        subCategory.getActive()
                ))
                .toList();
    }

    public SupCategoryResponse getSupCategoryById(Integer supCategoryId) {
        // find sup category by id or throw exception if not found
        SupCategory supCategory = supCategoryRepository.findById(supCategoryId)
                .orElseThrow(() -> new AppException(ErrorCode.SUP_CATEGORY_NOT_FOUND));
        return supCategoryMapper.toSupCategoryResponse(supCategory);
    }

    public SupCategoryResponse updateSupCategory(Integer supCategoryId, SupCategoryCreationRequest request) {
        // find sup category by id or throw exception if not found
        SupCategory supCategory = supCategoryRepository.findById(supCategoryId)
                .orElseThrow(() -> new AppException(ErrorCode.SUP_CATEGORY_NOT_FOUND));
        // check if the updated name already exists in db
        if (supCategoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new AppException(ErrorCode.SUP_CATEGORY_EXISTS);
        }
        // update sup category fields
        supCategory.setName(request.getName());
        // save updated sup category to repository
        SupCategory updatedSupCategory = supCategoryRepository.save(supCategory);
        return supCategoryMapper.toSupCategoryResponse(updatedSupCategory);
    }

    public List<SupCategoryResponse> getActiveSupCategories() {
        // check if there are any books stored in DB
        if (supCategoryRepository.countByActiveTrue() == 0) {
            throw new AppException(ErrorCode.NO_SUP_CATEGORIES_STORED);
        }

        // map list of active SupCategory to list of SupCategoryResponse
        List<SupCategory> supCategories = supCategoryRepository.findByActiveTrue();
        return supCategories.stream()
                .map(supCategoryMapper::toSupCategoryResponse)
                .toList();
    }

    public List<SupCategoryResponse> getInactiveSupCategories() {
        // check if there are any books stored in DB
        if (supCategoryRepository.count() == supCategoryRepository.countByActiveTrue()) {
            throw new AppException(ErrorCode.NO_SUP_CATEGORIES_STORED);
        }

        // map list of inactive SupCategory to list of SupCategoryResponse
        List<SupCategory> supCategories = supCategoryRepository.findAll().stream()
                .filter(supCategory -> !supCategory.getActive())
                .toList();
        return supCategories.stream()
                .map(supCategoryMapper::toSupCategoryResponse)
                .toList();
    }

    /**
     * Activate a sup category by its ID
     * @param supCategoryId
     * @return SupCategoryResponse
     */
    public SupCategoryResponse activateSupCategory(Integer supCategoryId) {
        // find sup category by id or throw exception if not found
        SupCategory supCategory = supCategoryRepository.findById(supCategoryId)
                .orElseThrow(() -> new AppException(ErrorCode.SUP_CATEGORY_NOT_FOUND));
        // activate sup category
        supCategory.setActive(true);
        // save activated sup category to repository
        SupCategory activatedSupCategory = supCategoryRepository.save(supCategory);
        return supCategoryMapper.toSupCategoryResponse(activatedSupCategory);
    }

    public SupCategoryResponse deactivateSupCategory(Integer supCategoryId) {
        // find sup category by id or throw exception if not found
        SupCategory supCategory = supCategoryRepository.findById(supCategoryId)
                .orElseThrow(() -> new AppException(ErrorCode.SUP_CATEGORY_NOT_FOUND));
        // deactivate sup category
        supCategory.setActive(false);
        // save deactivated sup category to repository
        SupCategory deactivatedSupCategory = supCategoryRepository.save(supCategory);
        return supCategoryMapper.toSupCategoryResponse(deactivatedSupCategory);
    }
}
