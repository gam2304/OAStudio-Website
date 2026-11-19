package com.oastudio.api.controller;

import com.oastudio.api.config.PasswordConfig;
import com.oastudio.api.config.SecurityConfig;
import com.oastudio.api.exception.LoginLockedException;
import com.oastudio.api.repository.AdminRepository;
import com.oastudio.api.security.CustomUserDetailsService;
import com.oastudio.api.service.AdminService;
import com.oastudio.api.service.AuthenticationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({AdminController.class, AuthController.class, SiteContentController.class})
@Import({SecurityConfig.class, PasswordConfig.class, CustomUserDetailsService.class})
class ApiSecurityTest {

    @Autowired MockMvc mockMvc;
    @MockitoBean AdminService adminService;
    @MockitoBean AuthenticationService authenticationService;
    @MockitoBean JwtDecoder jwtDecoder;
    @MockitoBean AdminRepository adminRepository;
    @MockitoBean com.oastudio.api.service.SiteContentService siteContentService;

    private static final String LOGIN_BODY = """
            {"username":"alice","password":"whatever"}
            """;

    @Test
    void missingTokenGivesJsonUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/admins"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string("WWW-Authenticate", "Bearer"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void wrongRoleGivesJsonForbidden() throws Exception {
        mockMvc.perform(get("/api/admin/admins")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isForbidden())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));
    }

    @Test
    void badLoginUsesStandardErrorBody() throws Exception {
        when(authenticationService.login(any())).thenThrow(new BadCredentialsException("bad"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(LOGIN_BODY))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void lockedLoginGives429() throws Exception {
        when(authenticationService.login(any())).thenThrow(new LoginLockedException());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(LOGIN_BODY))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void corsPreflightAllowsFrontendOrigin() throws Exception {
        mockMvc.perform(options("/api/admin/admins")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "DELETE")
                        .header("Access-Control-Request-Headers", "Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    void corsPreflightRejectsOtherOrigins() throws Exception {
        mockMvc.perform(options("/api/admin/admins")
                        .header("Origin", "https://evil.example")
                        .header("Access-Control-Request-Method", "DELETE"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }

    @Test
    void securityHeadersAreSent() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(LOGIN_BODY))
                .andExpect(header().string("Content-Security-Policy",
                        "default-src 'none'; frame-ancestors 'none'"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"));
    }

    @Test
    void landingPageContentIsPublicButOnlyAdminsCanEditIt() throws Exception {
        mockMvc.perform(get("/api/public/site/home")).andExpect(status().isOk());
        mockMvc.perform(put("/api/admin/site/home").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/admin/site/home").contentType(MediaType.APPLICATION_JSON).content("{}")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk());
    }
}
