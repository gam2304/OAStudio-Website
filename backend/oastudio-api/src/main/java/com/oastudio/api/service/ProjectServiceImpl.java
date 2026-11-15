
package com.oastudio.api.service;

import com.oastudio.api.dto.request.ProjectRequest;
import com.oastudio.api.dto.response.CategoryResponse;
import com.oastudio.api.dto.response.ProjectResponse;
import com.oastudio.api.entity.Category;
import com.oastudio.api.entity.Project;
import com.oastudio.api.enums.ProjectStatus;
import com.oastudio.api.exception.DuplicateResourceException;
import com.oastudio.api.exception.ResourceNotFoundException;
import com.oastudio.api.repository.CategoryRepository;
import com.oastudio.api.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final CategoryRepository categoryRepository;

    // PUBLIC WEBSITE

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getPublishedProjects() {

        return projectRepository.findByStatus(ProjectStatus.PUBLISHED)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getPublishedProjectBySlug(String slug) {

        Project project = projectRepository.findBySlug(slug)
                .filter(p -> p.getStatus() == ProjectStatus.PUBLISHED)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Published project not found with slug: " + slug
                        )
                );

        return mapToResponse(project);
    }

    // ADMIN DASHBOARD

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {

        return projectRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {

        Project project = findProjectById(id);

        return mapToResponse(project);
    }

    @Override
    public ProjectResponse createProject(ProjectRequest request) {

        if (projectRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException(
                    "Project slug already exists"
            );
        }

        Category category = findCategoryById(request.categoryId());

        Project project = new Project();

        project.setTitle(request.title());
        project.setSlug(request.slug());
        project.setLocation(request.location());
        project.setYear(request.year());
        project.setDescription(request.description());
        project.setArchitecturalConcept(request.architecturalConcept());
        project.setArea(request.area());
        project.setCoverImageUrl(request.coverImageUrl());
        project.setStatus(request.status());
        project.setCategory(category);

        Project savedProject = projectRepository.save(project);

        return mapToResponse(savedProject);
    }

    @Override
    public ProjectResponse updateProject(Long id, ProjectRequest request) {

        Project project = findProjectById(id);

        projectRepository.findBySlug(request.slug())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException(
                            "Project slug already exists"
                    );
                });

        Category category = findCategoryById(request.categoryId());

        project.setTitle(request.title());
        project.setSlug(request.slug());
        project.setLocation(request.location());
        project.setYear(request.year());
        project.setDescription(request.description());
        project.setArchitecturalConcept(request.architecturalConcept());
        project.setArea(request.area());
        project.setCoverImageUrl(request.coverImageUrl());
        project.setStatus(request.status());
        project.setCategory(category);

        Project updatedProject = projectRepository.save(project);

        return mapToResponse(updatedProject);
    }

    @Override
    public void deleteProject(Long id) {

        Project project = findProjectById(id);

        projectRepository.delete(project);
    }

    @Override
    public ProjectResponse updateProjectStatus(
            Long id, ProjectStatus status) {

        Project project = findProjectById(id);

        project.setStatus(status);

        return mapToResponse(projectRepository.save(project));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsByCategory(Long categoryId) {

        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException(
                    "Category not found with ID: " + categoryId
            );
        }

        return projectRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsByStatus(ProjectStatus status) {

        return projectRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // HELPER METHODS

    private Project findProjectById(Long id) {

        return projectRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found with ID: " + id
                        )
                );
    }

    private Category findCategoryById(Long id) {

        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with ID: " + id
                        )
                );
    }

    private ProjectResponse mapToResponse(Project project) {

        Category category = project.getCategory();

        CategoryResponse categoryResponse = new CategoryResponse(
                category.getId(),
                category.getCategoryName(),
                category.getSlug(),
                category.getDescription(),
                category.getCreatedAt()
        );

        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getSlug(),
                project.getLocation(),
                project.getYear(),
                project.getDescription(),
                project.getArchitecturalConcept(),
                project.getArea(),
                project.getCoverImageUrl(),
                project.getStatus(),
                categoryResponse,
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}