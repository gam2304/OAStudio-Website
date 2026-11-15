
package com.oastudio.api.repository;

import com.oastudio.api.entity.ProjectImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectImageRepository extends JpaRepository<ProjectImage, Long> {

    List<ProjectImage> findByProjectIdOrderByDisplayOrderAsc(Long projectId);

    void deleteByProjectId(Long projectId);
}
