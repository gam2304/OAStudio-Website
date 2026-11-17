
package com.oastudio.api.controller;

import com.oastudio.api.dto.request.ProjectImageRequest;
import com.oastudio.api.dto.response.ProjectImageResponse;
import com.oastudio.api.service.ProjectImageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class ProjectImageController {

    private final ProjectImageService projectImageService;

    // Get all images belonging to a project
    @GetMapping("/projects/{projectId}/images")
    public ResponseEntity<List<ProjectImageResponse>> getProjectImages(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                projectImageService.getProjectImages(projectId));
    }

    // Add an image to a project
    @PostMapping("/projects/{projectId}/images")
    public ResponseEntity<ProjectImageResponse> addProjectImage(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectImageRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectImageService.addProjectImage(projectId, request));
    }

    @PostMapping(
            value = "/projects/{projectId}/images/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ProjectImageResponse> uploadProjectImage(
            @PathVariable Long projectId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String altText,
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder) {

        ProjectImageResponse response = projectImageService.uploadProjectImage(
                projectId,
                file,
                altText,
                displayOrder
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Update an image
    @PutMapping("/project-images/{imageId}")
    public ResponseEntity<ProjectImageResponse> updateProjectImage(
            @PathVariable Long imageId,
            @Valid @RequestBody ProjectImageRequest request) {

        return ResponseEntity.ok(
                projectImageService.updateProjectImage(imageId, request));
    }

    // Delete an image
    @DeleteMapping("/project-images/{imageId}")
    public ResponseEntity<Void> deleteProjectImage(
            @PathVariable Long imageId) {

        projectImageService.deleteProjectImage(imageId);
        return ResponseEntity.noContent().build();
    }
}
