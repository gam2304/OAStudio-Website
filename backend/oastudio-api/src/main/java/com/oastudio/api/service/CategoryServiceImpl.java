
package com.oastudio.api.service;

import com.oastudio.api.dto.request.CategoryRequest;
import com.oastudio.api.dto.response.CategoryResponse;
import com.oastudio.api.entity.Category;
import com.oastudio.api.repository.CategoryRepository;
import com.oastudio.api.repository.ProjectRepository;
import com.oastudio.api.exception.ResourceInUseException;
import com.oastudio.api.exception.ResourceNotFoundException;
import com.oastudio.api.exception.DuplicateResourceException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProjectRepository projectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with ID: " + id
                        )
                );

        return mapToResponse(category);
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {

        if (categoryRepository.existsByCategoryName(request.categoryName())) {
            throw new DuplicateResourceException(
                    "Category name already exists"
            );
        }

        if (categoryRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException(
                    "Category slug already exists"
            );
        }

        Category category = new Category();

        category.setCategoryName(request.categoryName());
        category.setSlug(request.slug());
        category.setDescription(request.description());

        Category savedCategory = categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with ID: " + id
                        )
                );

        categoryRepository.findBySlug(request.slug())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException(
                            "Category slug already exists"
                    );
                });

        if (!category.getCategoryName().equals(request.categoryName())
                && categoryRepository.existsByCategoryName(request.categoryName())) {

            throw new DuplicateResourceException(
                    "Category name already exists"
            );
        }

        category.setCategoryName(request.categoryName());
        category.setSlug(request.slug());
        category.setDescription(request.description());

        Category updatedCategory = categoryRepository.save(category);

        return mapToResponse(updatedCategory);
    }

    @Override
    public void deleteCategory(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category not found with ID: " + id
                        )
                );

        long projects = projectRepository.countByCategoryId(id);
        if (projects > 0) {
            throw new ResourceInUseException(
                    "Category \"" + category.getCategoryName() + "\" is used by " + projects
                            + (projects == 1 ? " project" : " projects") + ". Move or delete them first.");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category category) {

        return new CategoryResponse(
                category.getId(),
                category.getCategoryName(),
                category.getSlug(),
                category.getDescription(),
                category.getCreatedAt()
        );
    }
}
