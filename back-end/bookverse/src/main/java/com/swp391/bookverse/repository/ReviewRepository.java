package com.swp391.bookverse.repository;

import com.swp391.bookverse.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBookId(Long bookId);
    List<Review> findByUserId(String userId);

    boolean existsByUserIdAndBookId(String id, Long id1);

    boolean existsByBookIdAndUserId(Long bookId, String userId);
}
