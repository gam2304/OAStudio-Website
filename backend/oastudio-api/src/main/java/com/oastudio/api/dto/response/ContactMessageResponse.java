package com.oastudio.api.dto.response;

import java.time.LocalDateTime;

public record ContactMessageResponse(

        Long id,
        String senderName,
        String senderEmail,
        String senderPhone,
        String projectType,
        String subject,
        String message,
        String status,
        LocalDateTime createdAt

) {}