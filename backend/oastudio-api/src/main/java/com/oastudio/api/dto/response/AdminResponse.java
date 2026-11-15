package com.oastudio.api.dto.response;

import java.time.LocalDateTime;

public record AdminResponse(

        Long id,
        String username,
        String email,
        String role,
        LocalDateTime createdAt

) {}