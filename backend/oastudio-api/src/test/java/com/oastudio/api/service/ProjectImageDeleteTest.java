package com.oastudio.api.service;

import com.oastudio.api.entity.ProjectImage;
import com.oastudio.api.repository.ProjectImageRepository;
import com.oastudio.api.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectImageDeleteTest {

    @Mock CloudinaryService cloudinaryService;
    @Mock ProjectImageRepository projectImageRepository;
    @Mock ProjectRepository projectRepository;
    @InjectMocks ProjectImageServiceImpl projectImageService;

    private static ProjectImage image(String publicId) {
        ProjectImage i = new ProjectImage();
        i.setId(3L);
        i.setImageUrl("g3.jpg");
        i.setPublicId(publicId);
        return i;
    }

    @Test
    void keepsCloudinaryAssetUsedAsCover() throws Exception {
        ProjectImage img = image("gallery/3");
        when(projectImageRepository.findById(3L)).thenReturn(Optional.of(img));
        when(projectRepository.existsByCoverPublicId("gallery/3")).thenReturn(true);

        projectImageService.deleteProjectImage(3L);

        verify(cloudinaryService, never()).deleteImage(any());
        verify(projectImageRepository).delete(img);
    }

    @Test
    void deletesCloudinaryAssetNotUsedAsCover() throws Exception {
        ProjectImage img = image("gallery/3");
        when(projectImageRepository.findById(3L)).thenReturn(Optional.of(img));
        when(projectRepository.existsByCoverPublicId("gallery/3")).thenReturn(false);

        projectImageService.deleteProjectImage(3L);

        verify(cloudinaryService).deleteImage("gallery/3");
        verify(projectImageRepository).delete(img);
    }
}
