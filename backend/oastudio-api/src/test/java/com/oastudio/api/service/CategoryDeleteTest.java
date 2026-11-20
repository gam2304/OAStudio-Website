package com.oastudio.api.service;

import com.oastudio.api.entity.Category;
import com.oastudio.api.exception.ResourceInUseException;
import com.oastudio.api.repository.CategoryRepository;
import com.oastudio.api.repository.ProjectRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryDeleteTest {

    @Mock CategoryRepository categoryRepository;
    @Mock ProjectRepository projectRepository;
    @InjectMocks CategoryServiceImpl categoryService;

    private static Category category() {
        Category c = new Category();
        c.setId(3L);
        c.setCategoryName("Villas");
        return c;
    }

    @Test
    void refusesCategoryStillUsedByProjects() {
        when(categoryRepository.findById(3L)).thenReturn(Optional.of(category()));
        when(projectRepository.countByCategoryId(3L)).thenReturn(2L);

        assertThatThrownBy(() -> categoryService.deleteCategory(3L))
                .isInstanceOf(ResourceInUseException.class)
                .hasMessage("Category \"Villas\" is used by 2 projects. Move or delete them first.");
        verify(categoryRepository, never()).delete(any());
    }

    @Test
    void deletesUnusedCategory() {
        Category c = category();
        when(categoryRepository.findById(3L)).thenReturn(Optional.of(c));
        when(projectRepository.countByCategoryId(3L)).thenReturn(0L);

        categoryService.deleteCategory(3L);

        verify(categoryRepository).delete(c);
    }
}
