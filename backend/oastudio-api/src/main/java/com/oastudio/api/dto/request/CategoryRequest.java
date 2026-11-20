package com.oastudio.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

        @NotBlank(message = "Category name is required")
        @Size(max = 100, message = "Category name must be at most 100 characters")
        String categoryName,

        @NotBlank(message = "Slug is required")
        @Size(max = 120, message = "Slug must be at most 120 characters")
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Slug may only contain lowercase letters, numbers and single hyphens")
        String slug,

        String description
) {
}
