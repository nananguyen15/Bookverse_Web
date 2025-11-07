package com.swp391.bookverse.configuration;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * @Author huangdat
 */

/**
 * Security configuration for the application.
 * This class configures security settings, including JWT authentication.
 */
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    // JWT signing key, used to sign and verify JWT tokens.
    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    // Define endpoint access rules based on user roles and HTTP methods

    String[] PUBLIC_POST_ENDPOINTS = {"api/auth/token", "api/auth/introspect", "api/users/create", "api/users/signup", "/api/otp/**"};
    String[] PUBLIC_GET_ENDPOINTS = {"api/users/myInfo","api/users/is-active/**","api/authors/**", "api/books/**", "api/publishers/**", "api/sup-categories/**", "api/sub-categories/**", "api/cart/myCart"};
    String[] PUBLIC_PUT_ENDPOINTS = {"api/users/myInfo"};

    String[] ADMIN_GET_ENDPOINTS = {"api/users/**"};
    String[] ADMIN_POST_ENDPOINTS = {"api/authors/**", "api/books/**", "api/publishers/**", "api/sup-categories/**", "/api/sub-categories/**"};
    String[] ADMIN_PUT_ENDPOINTS = {"api/authors/**" , "api/books/**", "api/publishers/**", "api/sup-categories/**", "/api/sub-categories/**","api/users/**"};
    String[] ADMIN_DELETE_ENDPOINTS = {""};

    String[] STAFF_GET_ENDPOINTS = {""};
    String[] STAFF_POST_ENDPOINTS = {""};
    String[] STAFF_PUT_ENDPOINTS = {""};
    String[] STAFF_DELETE_ENDPOINTS = {""};

    /**
     * Configures the security filter chain for the application.
     *
     * @param httpSecurity the HttpSecurity object to configure security settings.
     * @return SecurityFilterChain object that defines the security rules.
     * @throws Exception
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.cors(Customizer.withDefaults());

        // Define authorization rules for different endpoints and HTTP methods based on user roles and scopes in JWT
        httpSecurity.authorizeHttpRequests(request ->
                request
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/docs"              // because springdoc.swagger-ui.path = /docs
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.POST, PUBLIC_POST_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.PUT, PUBLIC_PUT_ENDPOINTS).permitAll()
//                        .requestMatchers(HttpMethod.GET, ADMIN_GET_ENDPOINTS).hasAnyAuthority("SCOPE_ADMIN")
                        .requestMatchers(HttpMethod.POST, ADMIN_POST_ENDPOINTS).hasAnyAuthority("SCOPE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, ADMIN_PUT_ENDPOINTS).hasAnyAuthority("SCOPE_ADMIN")
                        .anyRequest().authenticated());

        // Configure ability to use form login and basic authentication
        httpSecurity.oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder()))
        );

        // Disable CSRF protection for simplicity in this example.
        httpSecurity.csrf(httpSecurityCsrfConfigurer -> httpSecurityCsrfConfigurer.disable());

        return httpSecurity.build();
    }

    /**
     * Creates a JwtDecoder bean that uses a secret key to decode JWT tokens.
     *
     * @return JwtDecoder configured with the secret key and HS512 algorithm.
     */
    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(SIGNER_KEY.getBytes(StandardCharsets.UTF_8), "HS512");
        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}