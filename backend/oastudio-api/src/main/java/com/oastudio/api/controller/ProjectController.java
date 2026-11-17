
package com.oastudio.api.controller;

import com.oastudio.api.dto.request.ProjectRequest;
import com.oastudio.api.dto.response.ProjectResponse;
import com.oastudio.api.enums.ProjectStatus;
import com.oastudio.api.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    // PUBLIC ENDPOINTS

    @GetMapping("/api/public/projects")
    public ResponseEntity<List<ProjectResponse>> getPublishedProjects() {
        return ResponseEntity.ok(projectService.getPublishedProjects());
    }

    @GetMapping("/api/public/projects/{slug}")
    public ResponseEntity<ProjectResponse> getPublishedProjectBySlug(
            @PathVariable String slug) {
        return ResponseEntity.ok(
                projectService.getPublishedProjectBySlug(slug));
    }

    // ADMIN ENDPOINTS

    @GetMapping("/api/admin/projects")
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/api/admin/projects/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping("/api/admin/projects")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(request));
    }

    @PutMapping("/api/admin/projects/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(
                projectService.updateProject(id, request));
    }

    @DeleteMapping("/api/admin/projects/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/admin/projects/{id}/status")
    public ResponseEntity<ProjectResponse> updateProjectStatus(
            @PathVariable Long id,
            @RequestParam ProjectStatus status) {
        return ResponseEntity.ok(
                projectService.updateProjectStatus(id, status));
    }

    @GetMapping("/api/admin/projects/category/{categoryId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByCategory(
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(
                projectService.getProjectsByCategory(categoryId));
    }

    @GetMapping("/api/admin/projects/status/{status}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByStatus(
            @PathVariable ProjectStatus status) {
        return ResponseEntity.ok(
                projectService.getProjectsByStatus(status));
    }
}
