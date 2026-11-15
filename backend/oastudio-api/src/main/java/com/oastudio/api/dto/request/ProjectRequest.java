package com.oastudio.api.dto.request;

import com.oastudio.api.enums.ProjectStatus;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProjectRequest(

        @NotBlank(message = "Project title is required")
        @Size(max = 200)
        String title,

        @NotBlank(message = "Project slug is required")
        @Size(max = 220)
        String slug,

        @Size(max = 200)
        String location,

        @Min(1900)
        @Max(2100)
        Integer year,

        String description,

        String architecturalConcept,

        @DecimalMin("0.0")
        BigDecimal area,

        String coverImageUrl,

        @NotNull(message = "Project status is required")
        ProjectStatus status,

        @NotNull(message = "Category is required")
        Long categoryId

) {}