package com.swp391.bookverse.repository;

import com.swp391.bookverse.entity.Promotion;
import com.swp391.bookverse.entity.SubCategory;
import com.swp391.bookverse.entity.SupCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

/**
 * @Author huangdat
 */
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    boolean existsByNameIgnoreCase(String name);

    List<SubCategory> findBySupCategory(SupCategory supCategory);

    List<SubCategory> findByNameContainingIgnoreCase(String keyword);

    // Find all sub-categories whose promotion_id are the given id (only that id, not a list of ids). not using promotion entity to avoid join query
    List<SubCategory> findByPromotionId(Long promotionId);
}
