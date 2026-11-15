
package com.oastudio.api.repository;

import com.oastudio.api.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    boolean existsByCategoryName(String categoryName);

    boolean existsBySlug(String slug);
}
