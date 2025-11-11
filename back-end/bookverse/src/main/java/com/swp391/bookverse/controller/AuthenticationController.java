package com.swp391.bookverse.controller;

import com.swp391.bookverse.dto.APIResponse;
import com.swp391.bookverse.dto.request.AuthenticationRequest;
import com.swp391.bookverse.dto.request.IntrospectRequest;
import com.swp391.bookverse.dto.response.AuthenticationResponse;
import com.swp391.bookverse.dto.response.IntrospectResponse;
import com.swp391.bookverse.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

/**
 * @Author huangdat
 */
@RestController
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@RequestMapping("/api/auth")
public class AuthenticationController {
    AuthenticationService authenticationService;

    /**
     * Authenticate a user with username and password.
     * @param request
     * @return APIResponse with AuthenticationResponse containing authentication status and JWT token.
     */
    @PostMapping("/token")
    public APIResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {

        AuthenticationResponse response = authenticationService.authenticate(request);

        return APIResponse.<AuthenticationResponse>builder()
                .code(response.isAuthenticated() ? 200 : 401)
                .message(response.isAuthenticated() ? "Authentication successful" : "Authentication failed")
                .result(AuthenticationResponse.builder()
                        .authenticated(response.isAuthenticated())
                        .token(response.getToken())
                        .build())
                .build();
    }

    /**
     * Introspect a JWT token to check its validity.
     * @param request
     * @return APIResponse with IntrospectResponse indicating whether the token is valid.
     * @throws ParseException
     * @throws JOSEException
     */
    @PostMapping("/introspect")
    public APIResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {

        IntrospectResponse response = authenticationService.introspect(request);

        return APIResponse.<IntrospectResponse>builder()
                .code(response.isValid() ? 200 : 401)
                .message(response.isValid() ? "Token valid" : "Token invalid")
                .result(IntrospectResponse.builder()
                        .valid(response.isValid())
                        .username(response.getUsername())
                        .id(response.getId())
                        .role(response.getRole())
                        .active(response.getActive())
                        .build())
                .build();
    }

}
