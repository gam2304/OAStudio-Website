package com.oastudio.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminRequest(

        @NotBlank(message = "Username is required")
        @Size(max = 100)
        String username,

        @NotBlank(message = "Password is required")
        String password

) {}