package com.oastudio.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record ProjectImageRequest(

        @NotBlank(message = "Image URL is required")
        String imageUrl,

        @Size(max = 255)
        String altText,

        @NotNull
        @Min(0)
        Integer displayOrder

) {}