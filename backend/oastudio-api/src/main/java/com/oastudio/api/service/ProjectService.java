
package com.oastudio.api.service;

import com.oastudio.api.dto.request.ProjectRequest;
import com.oastudio.api.dto.response.ProjectResponse;
import com.oastudio.api.enums.ProjectStatus;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ProjectService {

    // Public website
    List<ProjectResponse> getPublishedProjects();

    ProjectResponse getPublishedProjectBySlug(String slug);

    // Admin dashboard
    List<ProjectResponse> getAllProjects();

    ProjectResponse getProjectById(Long id);

    ProjectResponse createProject(ProjectRequest request);

    ProjectResponse updateProject(Long id, ProjectRequest request);

    void deleteProject(Long id);

    ProjectResponse updateProjectStatus(Long id, ProjectStatus status);

    List<ProjectResponse> getProjectsByCategory(Long categoryId);

    List<ProjectResponse> getProjectsByStatus(ProjectStatus status);

    ProjectResponse uploadProjectCover(Long projectId, MultipartFile file);

    void deleteProjectCover(Long projectId);

    ProjectResponse setCoverFromGallery(Long projectId, Long imageId);

}
