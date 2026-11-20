package com.oastudio.api.service;

import com.oastudio.api.dto.response.ProjectResponse;
import com.oastudio.api.entity.Category;
import com.oastudio.api.entity.Project;
import com.oastudio.api.entity.ProjectImage;
import com.oastudio.api.exception.ResourceNotFoundException;
import com.oastudio.api.repository.CategoryRepository;
import com.oastudio.api.repository.ProjectImageRepository;
import com.oastudio.api.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectCoverTest {

    @Mock ProjectRepository projectRepository;
    @Mock CategoryRepository categoryRepository;
    @Mock ProjectImageRepository projectImageRepository;
    @Mock CloudinaryService cloudinaryService;
    @InjectMocks ProjectServiceImpl projectService;

    private static Project project(Long id, String coverUrl, String coverPublicId) {
        Category category = new Category();
        category.setId(1L);
        Project p = new Project();
        p.setId(id);
        p.setTitle("Villa");
        p.setSlug("villa");
        p.setCategory(category);
        p.setCoverImageUrl(coverUrl);
        p.setCoverPublicId(coverPublicId);
        return p;
    }

    private static ProjectImage image(Long id, Project owner, String url, String publicId) {
        ProjectImage i = new ProjectImage();
        i.setId(id);
        i.setProject(owner);
        i.setImageUrl(url);
        i.setPublicId(publicId);
        return i;
    }

    @Test
    void setCoverFromGalleryCopiesImageAndDeletesOldUploadedCover() throws Exception {
        Project p = project(7L, "old.jpg", "covers/old");
        when(projectRepository.findById(7L)).thenReturn(Optional.of(p));
        when(projectImageRepository.findById(3L)).thenReturn(Optional.of(image(3L, p, "g3.jpg", "gallery/3")));
        when(projectImageRepository.existsByPublicId("covers/old")).thenReturn(false);
        when(projectRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));

        ProjectResponse result = projectService.setCoverFromGallery(7L, 3L);

        assertThat(result.coverImageUrl()).isEqualTo("g3.jpg");
        assertThat(p.getCoverPublicId()).isEqualTo("gallery/3");
        verify(cloudinaryService).deleteImage("covers/old");
    }

    @Test
    void setCoverFromGalleryKeepsOldAssetStillUsedByGallery() throws Exception {
        Project p = project(7L, "g1.jpg", "gallery/1");
        when(projectRepository.findById(7L)).thenReturn(Optional.of(p));
        when(projectImageRepository.findById(3L)).thenReturn(Optional.of(image(3L, p, "g3.jpg", "gallery/3")));
        when(projectImageRepository.existsByPublicId("gallery/1")).thenReturn(true);
        when(projectRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));

        projectService.setCoverFromGallery(7L, 3L);

        verify(cloudinaryService, never()).deleteImage(any());
    }

    @Test
    void setCoverFromGalleryRejectsImageOfAnotherProject() {
        Project p = project(7L, null, null);
        when(projectRepository.findById(7L)).thenReturn(Optional.of(p));
        when(projectImageRepository.findById(3L)).thenReturn(Optional.of(
                image(3L, project(8L, null, null), "g3.jpg", "gallery/3")));

        assertThatThrownBy(() -> projectService.setCoverFromGallery(7L, 3L))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(projectRepository, never()).saveAndFlush(any());
    }

    @Test
    void deleteCoverKeepsAssetSharedWithGallery() throws Exception {
        Project p = project(7L, "g1.jpg", "gallery/1");
        when(projectRepository.findById(7L)).thenReturn(Optional.of(p));
        when(projectImageRepository.existsByPublicId("gallery/1")).thenReturn(true);

        projectService.deleteProjectCover(7L);

        verify(cloudinaryService, never()).deleteImage(any());
        assertThat(p.getCoverImageUrl()).isNull();
        assertThat(p.getCoverPublicId()).isNull();
    }

    @Test
    void deleteCoverDeletesUnsharedAsset() throws Exception {
        Project p = project(7L, "old.jpg", "covers/old");
        when(projectRepository.findById(7L)).thenReturn(Optional.of(p));
        when(projectImageRepository.existsByPublicId("covers/old")).thenReturn(false);

        projectService.deleteProjectCover(7L);

        verify(cloudinaryService).deleteImage("covers/old");
    }
}
