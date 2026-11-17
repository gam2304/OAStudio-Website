
package com.oastudio.api.service;

import com.oastudio.api.dto.request.ProjectImageRequest;
import com.oastudio.api.dto.response.ProjectImageResponse;
import org.springframework.web.multipart.MultipartFile;

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

    ProjectImageResponse uploadProjectImage(
            Long projectId,
            MultipartFile file,
            String altText,
            Integer displayOrder
    );

    void deleteProjectImage(Long imageId);
}
