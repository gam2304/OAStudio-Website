
package com.oastudio.api.repository;

import com.oastudio.api.entity.Project;
import com.oastudio.api.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Project> findByStatus(ProjectStatus status);

    List<Project> findByCategoryId(Long categoryId);

    List<Project> findByStatusAndCategoryId(
            ProjectStatus status,
            Long categoryId
    );
}

