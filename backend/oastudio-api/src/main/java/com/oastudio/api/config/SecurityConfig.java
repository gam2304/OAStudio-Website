
package com.oastudio.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                // We use JWT bearer tokens, not session-based authentication
                .csrf(csrf -> csrf.disable())

                // Configure endpoint permissions
                .authorizeHttpRequests(auth -> auth

                        // Login endpoint
                        .requestMatchers(HttpMethod.POST, "/api/auth/login")
                        .permitAll()

                        // Public website endpoints
                        .requestMatchers(HttpMethod.GET, "/api/public/**")
                        .permitAll()

                        // Public contact form
                        .requestMatchers(HttpMethod.POST, "/api/contact-messages")
                        .permitAll()

                        // CORS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // Administrator endpoints
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // All remaining endpoints require authentication
                        .anyRequest()
                        .authenticated()
                )

                // Disable HTTP sessions
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Enable JWT authentication
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(Customizer.withDefaults())
                );

        return http.build();
    }
}
