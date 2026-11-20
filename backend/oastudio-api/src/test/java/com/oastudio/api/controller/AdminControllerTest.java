package com.oastudio.api.controller;

import com.oastudio.api.config.PasswordConfig;
import com.oastudio.api.config.SecurityConfig;
import com.oastudio.api.security.CustomUserDetailsService;
import com.oastudio.api.dto.request.ChangePasswordRequest;
import com.oastudio.api.dto.request.CreateAdminRequest;
import com.oastudio.api.dto.request.ResetPasswordRequest;
import com.oastudio.api.dto.response.AdminResponse;
import com.oastudio.api.exception.OperationNotAllowedException;
import com.oastudio.api.repository.AdminRepository;
import com.oastudio.api.service.AdminService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({AdminController.class, AccountController.class})
@Import({SecurityConfig.class, PasswordConfig.class, CustomUserDetailsService.class})
class AdminControllerTest {

    @Autowired MockMvc mockMvc;
    @MockitoBean AdminService adminService;
    @MockitoBean JwtDecoder jwtDecoder;
    @MockitoBean AdminRepository adminRepository;

    private static RequestPostProcessor superAdmin() {
        return jwt().authorities(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("ROLE_SUPER_ADMIN"));
    }

    private static RequestPostProcessor regularAdmin() {
        return jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    private static final String VALID_BODY = """
            {"username":"helper","email":"helper@studio.tn","password":"Secret123!"}
            """;

    @Test
    void superAdminListsAdmins() throws Exception {
        when(adminService.getAllAdmins()).thenReturn(List.of(
                new AdminResponse(1L, "main", "main@studio.tn", "SUPER_ADMIN", null)));

        mockMvc.perform(get("/api/admin/admins").with(superAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("main"))
                .andExpect(jsonPath("$[0].passwordHash").doesNotExist());
    }

    @Test
    void superAdminCreatesAdmin() throws Exception {
        when(adminService.createAdmin(any())).thenReturn(
                new AdminResponse(5L, "helper", "helper@studio.tn", "ADMIN", null));

        mockMvc.perform(post("/api/admin/admins").with(superAdmin())
                        .contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.role").value("ADMIN"));

        verify(adminService).createAdmin(new CreateAdminRequest("helper", "helper@studio.tn", "Secret123!"));
    }

    @Test
    void createRejectsInvalidBody() throws Exception {
        mockMvc.perform(post("/api/admin/admins").with(superAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"","email":"not-an-email","password":"short"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.username").exists())
                .andExpect(jsonPath("$.messages.email").exists())
                .andExpect(jsonPath("$.messages.password").exists());

        verifyNoInteractions(adminService);
    }

    @Test
    void superAdminDeletesAdmin() throws Exception {
        mockMvc.perform(delete("/api/admin/admins/2").with(superAdmin()))
                .andExpect(status().isNoContent());

        verify(adminService).deleteAdmin(2L);
    }

    @Test
    void deletingSuperAdminReturnsForbidden() throws Exception {
        doThrow(new OperationNotAllowedException("The main administrator cannot be removed"))
                .when(adminService).deleteAdmin(1L);

        mockMvc.perform(delete("/api/admin/admins/1").with(superAdmin()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("The main administrator cannot be removed"));
    }

    @Test
    void regularAdminCannotManageAdmins() throws Exception {
        mockMvc.perform(get("/api/admin/admins").with(regularAdmin()))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/admin/admins").with(regularAdmin())
                        .contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/admin/admins/2").with(regularAdmin()))
                .andExpect(status().isForbidden());

        verifyNoInteractions(adminService);
    }

    private static Jwt bearer(String username, String... roles) {
        return Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .subject(username)
                .claim("roles", List.of(roles))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(900))
                .build();
    }

    @Test
    void tokenOfExistingSuperAdminIsAccepted() throws Exception {
        when(jwtDecoder.decode("token")).thenReturn(bearer("main", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"));
        when(adminRepository.existsByUsername("main")).thenReturn(true);

        mockMvc.perform(get("/api/admin/admins").header("Authorization", "Bearer token"))
                .andExpect(status().isOk());
    }

    @Test
    void tokenOfRemovedAdminIsRejected() throws Exception {
        when(jwtDecoder.decode("token")).thenReturn(bearer("helper", "ROLE_ADMIN"));
        when(adminRepository.existsByUsername("helper")).thenReturn(false);

        mockMvc.perform(get("/api/admin/categories").header("Authorization", "Bearer token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void superAdminResetsAdminPassword() throws Exception {
        mockMvc.perform(put("/api/admin/admins/2/password").with(superAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"newPassword":"Reset1234"}
                                """))
                .andExpect(status().isNoContent());

        verify(adminService).resetPassword(2L, new ResetPasswordRequest("Reset1234"));
    }

    @Test
    void regularAdminCannotResetPasswords() throws Exception {
        mockMvc.perform(put("/api/admin/admins/2/password").with(regularAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"newPassword":"Reset1234"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").exists());

        verifyNoInteractions(adminService);
    }

    @Test
    void anyAdminChangesOwnPassword() throws Exception {
        mockMvc.perform(put("/api/admin/account/password")
                        .with(jwt().jwt(j -> j.subject("helper"))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"OldSecret1","newPassword":"NewSecret1"}
                                """))
                .andExpect(status().isNoContent());

        verify(adminService).changeOwnPassword(
                eq("helper"), eq(new ChangePasswordRequest("OldSecret1", "NewSecret1")));
    }

    @Test
    void changeOwnPasswordValidatesBody() throws Exception {
        mockMvc.perform(put("/api/admin/account/password").with(regularAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"","newPassword":"short"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.currentPassword").exists())
                .andExpect(jsonPath("$.messages.newPassword").exists());

        verifyNoInteractions(adminService);
    }

    @Test
    void anonymousCannotManageAdmins() throws Exception {
        mockMvc.perform(get("/api/admin/admins"))
                .andExpect(status().isUnauthorized());
    }
}
