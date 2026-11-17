
package com.oastudio.api.service;

import com.oastudio.api.dto.request.ProjectImageRequest;
import com.oastudio.api.dto.response.ProjectImageResponse;
import com.oastudio.api.entity.Project;
import com.oastudio.api.entity.ProjectImage;
import com.oastudio.api.exception.ResourceNotFoundException;
import com.oastudio.api.repository.ProjectImageRepository;
import com.oastudio.api.repository.ProjectRepository;

import java.io.IOException;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectImageServiceImpl implements ProjectImageService {

    private final CloudinaryService cloudinaryService;
    private final ProjectImageRepository projectImageRepository;
    private final ProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProjectImageResponse> getProjectImages(Long projectId) {

        findProjectById(projectId);

        return projectImageRepository
                .findByProjectIdOrderByDisplayOrderAsc(projectId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ProjectImageResponse addProjectImage(
            Long projectId,
            ProjectImageRequest request) {

        Project project = findProjectById(projectId);

        ProjectImage image = new ProjectImage();

        image.setImageUrl(request.imageUrl());
        image.setAltText(request.altText());
        image.setDisplayOrder(request.displayOrder());
        image.setProject(project);

        ProjectImage savedImage = projectImageRepository.save(image);

        return mapToResponse(savedImage);
    }

    @Override
    public ProjectImageResponse updateProjectImage(
            Long imageId,
            ProjectImageRequest request) {

        ProjectImage image = findImageById(imageId);

        image.setImageUrl(request.imageUrl());
        image.setAltText(request.altText());
        image.setDisplayOrder(request.displayOrder());

        ProjectImage updatedImage = projectImageRepository.save(image);

        return mapToResponse(updatedImage);
    }

    @Override
    public void deleteProjectImage(Long imageId) {

        ProjectImage image = findImageById(imageId);

        projectImageRepository.delete(image);
    }

    @Override
    public ProjectImageResponse uploadProjectImage(
            Long projectId,
            MultipartFile file,
            String altText,
            Integer displayOrder) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found with ID: " + projectId
                        )
                );

        try {
            Map uploadResult = cloudinaryService.uploadImage(file, projectId);

            String imageUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            if (imageUrl == null || publicId == null) {
                throw new IllegalStateException(
                        "Cloudinary did not return the expected image information"
                );
            }

            ProjectImage image = new ProjectImage();
            image.setImageUrl(imageUrl);
            image.setPublicId(publicId);
            image.setAltText(altText);
            image.setDisplayOrder(displayOrder != null ? displayOrder : 0);
            image.setProject(project);

            ProjectImage savedImage = projectImageRepository.save(image);

            return mapToResponse(savedImage);

        } catch (IOException exception) {
            throw new RuntimeException("Failed to upload image to Cloudinary", exception);
        }
    }

    // HELPER METHODS

    private Project findProjectById(Long projectId) {

        return projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found with ID: " + projectId
                        )
                );
    }

    private ProjectImage findImageById(Long imageId) {

        return projectImageRepository.findById(imageId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project image not found with ID: " + imageId
                        )
                );
    }

    private ProjectImageResponse mapToResponse(ProjectImage image) {

        return new ProjectImageResponse(
                image.getId(),
                image.getImageUrl(),
                image.getAltText(),
                image.getDisplayOrder(),
                image.getCreatedAt()
        );
    }
}
