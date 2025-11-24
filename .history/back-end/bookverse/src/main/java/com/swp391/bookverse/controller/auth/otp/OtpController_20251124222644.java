package com.swp391.bookverse.controller.auth.otp;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.auth.otp.SendByEmailRequest;
// import com.swp391.bookverse.dto.request.auth.otp.SendForUserRequest;
import com.swp391.bookverse.dto.request.auth.otp.VerifyRequest;
import com.swp391.bookverse.dto.request.auth.otp.VerifyResetPasswordRequest;
import com.swp391.bookverse.service.auth.otp.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @Author huangdat
 */
@RestController
@RequestMapping("/api/otp")
public class OtpController {
    private final OtpService svc;

    public OtpController(OtpService svc) { this.svc = svc; }

    /**
     * Send OTP to email for a specific token type (default: LOGIN)
     * @param req
     * @return ResponseEntity
     */
    @PostMapping("/send-by-email")
    public APIResponse<?> sendByEmail(@RequestBody SendByEmailRequest req) {
        return svc.sendOtpByEmail(req);
    }

    @PostMapping("/send-by-email-reset-password")
    public APIResponse<?> sendByEmailResetPassword(@RequestBody SendByEmailRequest req) {
        return svc.sendOtpByEmailResetPassword(req);
    }

//    /**
//     * Send OTP to email for a specific user and token type (default: LOGIN)
//     * @param req
//     * @return ResponseEntity
//     */
//    @PostMapping("/send-for-user")
//    public ResponseEntity<?> sendForUser(@RequestBody SendForUserRequest req) {
//        svc.sendOtpForUser(req);
//        return ResponseEntity.ok().build();
//    }

    /**
     * Verify OTP code for a user and token type (default: LOGIN)
     * @param req
     * @return ResponseEntity
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody VerifyRequest req) {
        APIResponse<?> response = svc.verify(req);
        return response.getCode() == 200 ? ResponseEntity.ok(response) : ResponseEntity.status(400).body(response);
    }

    @PostMapping("/verify-reset-password")
    public ResponseEntity<?> verifyResetPassword(@RequestBody VerifyResetPasswordRequest req) {
        APIResponse<?> response = new APIResponse<>();
        response = svc.verifyResetPassword(req);
        return response.getCode() == 200 ? ResponseEntity.ok(response) : ResponseEntity.status(400).body(response);
    }
}
