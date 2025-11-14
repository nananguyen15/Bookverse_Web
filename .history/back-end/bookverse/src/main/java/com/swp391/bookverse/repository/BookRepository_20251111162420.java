package com.swp391.bookverse.repository;

import com.swp391.bookverse.entity.Book;
import com.swp391.bookverse.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

/**
 * @Author huangdat
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    // Find an Book by their name
    Book findByTitleIgnoreCase(String title);
    // Check if an Book exists by their name
    boolean existsByTitleIgnoreCase(String title);
    // Find Books whose names contain a specific keyword (case-insensitive)
    List<Book> findByTitleContainingIgnoreCase(String keyword);

    List<Book> findByCategoryAndActive(SubCategory category, boolean active);

    List<Book> findByAuthorId(Long id);
    
    @Modifying
    @Query("UPDATE Book b SET b.active = :active WHERE b.category.id = :subCategoryId")
    void updateActiveBySubCategoryId(@Param("subCategoryId") Long subCategoryId, @Param("active") Boolean active);
    
    @Modifying
    @Query("UPDATE Book b SET b.active = :active WHERE b.category.supCategory.id = :supCategoryId")
    void updateActiveBySupCategoryId(@Param("supCategoryId") Integer supCategoryId, @Param("active") Boolean active);
}