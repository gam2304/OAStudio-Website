
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

import java.io.IOException;
import java.util.List;
import com.oastudio.api.entity.ProjectImage;
import com.oastudio.api.repository.ProjectImageRepository;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final CategoryRepository categoryRepository;
    private final ProjectImageRepository projectImageRepository;
    private final CloudinaryService cloudinaryService;

    // PUBLIC WEBSITE

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getPublishedProjects() {

        return projectRepository.findByStatusOrderByCreatedAtDescIdDesc(ProjectStatus.PUBLISHED)
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

        List<ProjectImage> images =
                projectImageRepository.findByProjectIdOrderByDisplayOrderAsc(id);

        try {
            // Step 1: Delete images from Cloudinary
            for (ProjectImage image : images) {
                if (image.getPublicId() != null) {
                    cloudinaryService.deleteImage(image.getPublicId());
                }
            }

            // Step 2: Explicitly delete image records from PostgreSQL
            projectImageRepository.deleteAllByProjectIdInBulk(id);

            // Step 3: Delete the project
            projectRepository.deleteById(id);

        } catch (IOException exception) {
            throw new RuntimeException(
                    "Failed to delete project images from Cloudinary",
                    exception
            );
        }
    }
    @Override
    public ProjectResponse updateProjectStatus(
            Long id, ProjectStatus status) {

        Project project = findProjectById(id);

        project.setStatus(status);

        return mapToResponse(projectRepository.save(project));
    }

    @Override
    public ProjectResponse uploadProjectCover(Long projectId, MultipartFile file) {

        Project project = findProjectById(projectId);

        try {
            // Upload the new cover first
            Map uploadResult = cloudinaryService.uploadImage(file, projectId);

            String newImageUrl = (String) uploadResult.get("secure_url");
            String newPublicId = (String) uploadResult.get("public_id");

            if (newImageUrl == null || newPublicId == null) {
                throw new IllegalStateException(
                        "Cloudinary did not return the expected image information"
                );
            }

            String oldPublicId = project.getCoverPublicId();

            // Update project information
            project.setCoverImageUrl(newImageUrl);
            project.setCoverPublicId(newPublicId);

            try {
                Project updatedProject = projectRepository.saveAndFlush(project);

                // Delete old cover only after the new cover is saved
                if (isUnusedCoverAsset(oldPublicId)) {
                    try {
                        cloudinaryService.deleteImage(oldPublicId);
                    } catch (IOException cleanupException) {
                        // Keep the new cover even if old-image cleanup fails
                        throw new RuntimeException(
                                "New cover saved, but the previous cover could not be deleted",
                                cleanupException
                        );
                    }
                }

                return mapToResponse(updatedProject);

            } catch (RuntimeException databaseException) {

                // Restore Cloudinary if saving the new cover fails
                try {
                    cloudinaryService.deleteImage(newPublicId);
                } catch (IOException cleanupException) {
                    databaseException.addSuppressed(cleanupException);
                }

                throw databaseException;
            }

        } catch (IOException exception) {
            throw new RuntimeException(
                    "Failed to upload project cover to Cloudinary",
                    exception
            );
        }
    }

    @Override
    public void deleteProjectCover(Long projectId) {

        Project project = findProjectById(projectId);

        String publicId = project.getCoverPublicId();

        if (isUnusedCoverAsset(publicId)) {
            try {
                cloudinaryService.deleteImage(publicId);
            } catch (IOException exception) {
                throw new RuntimeException(
                        "Failed to delete project cover from Cloudinary",
                        exception
                );
            }
        }

        project.setCoverImageUrl(null);
        project.setCoverPublicId(null);

        projectRepository.save(project);
    }

    @Override
    public ProjectResponse setCoverFromGallery(Long projectId, Long imageId) {

        Project project = findProjectById(projectId);

        ProjectImage image = projectImageRepository.findById(imageId)
                .filter(i -> i.getProject().getId().equals(projectId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Image " + imageId + " not found in project " + projectId));

        String oldPublicId = project.getCoverPublicId();

        // Cover and gallery image now share one Cloudinary asset.
        project.setCoverImageUrl(image.getImageUrl());
        project.setCoverPublicId(image.getPublicId());

        Project updatedProject = projectRepository.saveAndFlush(project);

        // Old cover was a separate upload: remove it so it is not orphaned.
        if (isUnusedCoverAsset(oldPublicId)) {
            try {
                cloudinaryService.deleteImage(oldPublicId);
            } catch (IOException exception) {
                throw new RuntimeException(
                        "New cover saved, but the previous cover could not be deleted",
                        exception
                );
            }
        }

        return mapToResponse(updatedProject);
    }

    // A cover asset may also be a gallery image (seed data, or chosen from the gallery).
    private boolean isUnusedCoverAsset(String publicId) {
        return publicId != null
                && !publicId.isBlank()
                && !projectImageRepository.existsByPublicId(publicId);
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

        return projectRepository.findByStatusOrderByCreatedAtDescIdDesc(status)
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