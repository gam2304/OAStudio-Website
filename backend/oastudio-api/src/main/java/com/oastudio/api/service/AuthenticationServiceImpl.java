package com.oastudio.api.service;

import com.oastudio.api.dto.request.AdminRequest;
import com.oastudio.api.dto.response.AuthResponse;
import com.oastudio.api.security.LoginAttemptService;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final LoginAttemptService loginAttemptService;

    @Value("${app.security.jwt.issuer}")
    private String issuer;

    @Value("${app.security.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Override
    public AuthResponse login(AdminRequest request) {

        loginAttemptService.checkNotLocked(request.username());

        // Authenticate administrator credentials
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.username(),
                            request.password()
                    )
            );
        } catch (AuthenticationException exception) {
            loginAttemptService.recordFailure(request.username());
            throw exception;
        }

        loginAttemptService.recordSuccess(request.username());

        // Define token timestamps
        Instant now = Instant.now();
        Instant expiration = now.plusSeconds(accessTokenExpiration);

        // Extract administrator authorities
        List<String> roles = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        // Build JWT claims
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(expiration)
                .subject(authentication.getName())
                .claim("roles", roles)
                .build();

        // Sign the JWT using RSA
        JwsHeader header = JwsHeader.with(SignatureAlgorithm.RS256)
                .build();

        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)
        ).getTokenValue();

        return new AuthResponse(
                token,
                "Bearer",
                accessTokenExpiration
        );
    }
}
