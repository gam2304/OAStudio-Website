package com.oastudio.api.dto.response;

import com.oastudio.api.enums.ProjectStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProjectResponse(

        Long id,
        String title,
        String slug,
        String location,
        Integer year,
        String description,
        String architecturalConcept,
        BigDecimal area,
        String coverImageUrl,
        ProjectStatus status,
        CategoryResponse category,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {}