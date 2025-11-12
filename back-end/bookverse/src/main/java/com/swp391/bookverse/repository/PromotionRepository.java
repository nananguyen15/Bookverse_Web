package com.swp391.bookverse.repository;

import com.swp391.bookverse.entity.Promotion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    @Query("SELECT p FROM Promotion p WHERE :currentDate BETWEEN p.startDate AND p.endDate")
    List<Promotion> findActivePromotions(LocalDate currentDate);

    @Query("SELECT p FROM Promotion p WHERE p.endDate < :currentDate")
    List<Promotion> findExpiredPromotions(LocalDate currentDate);

    boolean existsByContentIgnoreCase(@NotBlank(message = "Content is required") @Size(max = 255, message = "Content must not exceed 255 characters") String content);

}
