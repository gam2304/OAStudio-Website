package com.oastudio.api.controller;

import com.oastudio.api.dto.request.ChangePasswordRequest;
import com.oastudio.api.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

// The logged-in admin's own account; open to every admin.
@RestController
@RequestMapping("/api/admin/account")
@RequiredArgsConstructor
public class AccountController {

    private final AdminService adminService;

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ChangePasswordRequest request) {
        adminService.changeOwnPassword(jwt.getSubject(), request);
        return ResponseEntity.noContent().build();
    }
}
