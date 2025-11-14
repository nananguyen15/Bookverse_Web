package com.swp391.bookverse.repository;

import com.swp391.bookverse.entity.SubCategory;
import com.swp391.bookverse.entity.SupCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * @Author huangdat
 */
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
    boolean existsByNameIgnoreCase(String name);

    List<SubCategory> findBySupCategory(SupCategory supCategory);

    List<SubCategory> findByNameContainingIgnoreCase(String keyword);
    
    @Modifying
    @Query("UPDATE SubCategory sc SET sc.active = :active WHERE sc.supCategory.id = :supCategoryId")
    void updateActiveBySupCategoryId(@Param("supCategoryId") Integer supCategoryId, @Param("active") Boolean active);
}
