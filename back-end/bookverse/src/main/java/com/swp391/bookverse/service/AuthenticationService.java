package com.swp391.bookverse.service;


import com.swp391.bookverse.dto.request.AuthenticationRequest;
import com.swp391.bookverse.dto.request.IntrospectRequest;
import com.swp391.bookverse.dto.response.AuthenticationResponse;
import com.swp391.bookverse.dto.response.IntrospectResponse;
import com.swp391.bookverse.exception.AppException;
import com.swp391.bookverse.exception.ErrorCode;
import com.swp391.bookverse.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Set;

@Service
@RequiredArgsConstructor // Generates a constructor with required arguments for final fields.
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true) // Set default access level for fields to private
public class AuthenticationService {
    UserRepository userRepository;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    /**
     * Authenticate a user with username and password.
     * @param request
     * @return AuthenticationResponse containing authentication status and JWT token.
     */
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        // Check if the provided password matches the stored password
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());

        // Consider authentication result to generate a JWT token or handle further logic
        if (!authenticated) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Build the response object with authentication status and token
        String token = generateToken(user.getUsername());
        AuthenticationResponse response = AuthenticationResponse.builder()
                .authenticated(authenticated) // always true if pass the exception check
                .token(token) // Include the generated token in the resp
                .build();
        return response;
    }

    /**
     * Generate a JWT token for the authenticated user.
     * @param username
     * @return JWT token as a string.
     */
    private String generateToken(String username) {
        // Create a JWSHeader with the desired algorithm
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        // define the claims for the JWT
        Set<String> roles = userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)).getRoles();
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(username)
                .issuer("http://localhost:8080/bookverse")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                ))
                .claim("scope", String.join(" ", roles))
                .build();

        // Create a payload with the claims
        Payload payload = new Payload(claimsSet.toJSONObject());

        // Create a JWSObject with the header and payload
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize(); // Serialize the JWS object to a compact string representation
        } catch (JOSEException e) {
            // announce the error
            System.err.println("Error generating JWT token: " + e.getMessage());
            throw new RuntimeException(e);
        }

    }

    public IntrospectResponse introspect(IntrospectRequest request)
            throws JOSEException, ParseException {
        var token = request.getToken();

        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        return IntrospectResponse.builder()
                .valid(verified && expiryTime.after(new Date()))
                .username(signedJWT.getJWTClaimsSet().getSubject())
                .id(userRepository.findByUsername(signedJWT.getJWTClaimsSet().getSubject())
                        .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND)).getId().toString())
                .role(signedJWT.getJWTClaimsSet().getStringClaim("scope"))
                .build();
    }
}
