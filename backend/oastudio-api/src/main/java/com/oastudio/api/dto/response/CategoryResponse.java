
package com.oastudio.api.dto.response;

import java.time.LocalDateTime;

public record CategoryResponse(
        Long id,
        String categoryName,
        String slug,
        String description,
        LocalDateTime createdAt
) {
}
