package com.swp391.bookverse.repository.auth.otp;

import com.swp391.bookverse.entity.auth.otp.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);
    Optional<OtpToken> findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(String userId);
    List<OtpToken> findAllByEmailAndUsedFalse(String email);
    
    @Modifying
    @Query("UPDATE OtpToken o SET o.used = true WHERE o.email = :email AND o.used = false")
    int markAllAsUsedByEmail(@Param("email") String email);
}
