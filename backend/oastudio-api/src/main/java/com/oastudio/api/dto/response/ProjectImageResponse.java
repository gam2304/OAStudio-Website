package com.oastudio.api.dto.response;

import java.time.LocalDateTime;

public record ProjectImageResponse(

        Long id,
        String imageUrl,
        String altText,
        Integer displayOrder,
        LocalDateTime createdAt

) {}