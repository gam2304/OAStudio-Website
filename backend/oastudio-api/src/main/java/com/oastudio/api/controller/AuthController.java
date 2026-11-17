
package com.oastudio.api.controller;

import com.oastudio.api.dto.request.AdminRequest;
import com.oastudio.api.dto.response.AuthResponse;
import com.oastudio.api.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody AdminRequest request) {

        return ResponseEntity.ok(authenticationService.login(request));
    }
}
