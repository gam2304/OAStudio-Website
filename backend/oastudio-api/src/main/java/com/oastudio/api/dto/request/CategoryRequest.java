
package com.oastudio.api.dto.request;

public record CategoryRequest(
        String categoryName,
        String slug,
        String description
) {
}
