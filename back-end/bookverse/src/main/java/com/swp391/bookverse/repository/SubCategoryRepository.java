package com.swp391.bookverse.repository;

import com.swp391.bookverse.entity.SubCategory;
import com.swp391.bookverse.entity.SupCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * @Author huangdat
 */
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    boolean existsByNameIgnoreCase(String name);

    List<SubCategory> findBySupCategory(SupCategory supCategory);

    List<SubCategory> findByNameContainingIgnoreCase(String keyword);
}
