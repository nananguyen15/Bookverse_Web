package com.swp391.bookverse.repository.auth.otp;

import com.swp391.bookverse.entity.auth.otp.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);
    Optional<OtpToken> findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(String userId);
}
