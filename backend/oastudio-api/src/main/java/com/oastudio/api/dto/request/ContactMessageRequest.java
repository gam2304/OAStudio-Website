package com.oastudio.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactMessageRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 150)
        String senderName,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        @Size(max = 200)
        String senderEmail,

        @Size(max = 255)
        String subject,

        @NotBlank(message = "Message is required")
        String message

) {}