
package com.oastudio.api.service;

import com.oastudio.api.dto.request.ProjectImageRequest;
import com.oastudio.api.dto.response.ProjectImageResponse;

import java.util.List;

public interface ProjectImageService {

    List<ProjectImageResponse> getProjectImages(Long projectId);

    ProjectImageResponse addProjectImage(
            Long projectId,
            ProjectImageRequest request
    );

    ProjectImageResponse updateProjectImage(
            Long imageId,
            ProjectImageRequest request
    );

    void deleteProjectImage(Long imageId);
}
