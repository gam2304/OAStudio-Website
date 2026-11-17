package com.oastudio.api.repository;

import com.oastudio.api.entity.ProjectImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectImageRepository extends JpaRepository<ProjectImage, Long> {

    List<ProjectImage> findByProjectIdOrderByDisplayOrderAsc(Long projectId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ProjectImage pi WHERE pi.project.id = :projectId")
    void deleteAllByProjectIdInBulk(@Param("projectId") Long projectId);
}