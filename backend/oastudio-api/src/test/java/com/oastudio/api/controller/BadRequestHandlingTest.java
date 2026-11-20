package com.oastudio.api.controller;

import com.oastudio.api.config.PasswordConfig;
import com.oastudio.api.config.SecurityConfig;
import com.oastudio.api.exception.InvalidRequestException;
import com.oastudio.api.repository.AdminRepository;
import com.oastudio.api.security.CustomUserDetailsService;
import com.oastudio.api.service.CategoryService;
import com.oastudio.api.service.ProjectImageService;
import com.oastudio.api.service.ProjectService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Client mistakes must come back as 4xx with a readable message, never 500. */
@WebMvcTest({CategoryController.class, ProjectController.class, ProjectImageController.class})
@Import({SecurityConfig.class, PasswordConfig.class, CustomUserDetailsService.class})
class BadRequestHandlingTest {

    @Autowired MockMvc mockMvc;
    @MockitoBean CategoryService categoryService;
    @MockitoBean ProjectService projectService;
    @MockitoBean ProjectImageService projectImageService;
    @MockitoBean JwtDecoder jwtDecoder;
    @MockitoBean AdminRepository adminRepository;

    private static RequestPostProcessor admin() {
        return jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    // ---- 1. blank category fields

    @Test
    void blankCategoryFieldsAreRejected() throws Exception {
        mockMvc.perform(post("/api/admin/categories").with(admin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"categoryName":"  ","slug":""}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.categoryName").exists())
                .andExpect(jsonPath("$.messages.slug").exists());

        verifyNoInteractions(categoryService);
    }

    @Test
    void invalidSlugIsRejected() throws Exception {
        mockMvc.perform(put("/api/admin/categories/1").with(admin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"categoryName":"Villas","slug":"Villas & Pools!"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.messages.slug").exists());

        verifyNoInteractions(categoryService);
    }

    @Test
    void malformedJsonIsRejected() throws Exception {
        mockMvc.perform(post("/api/admin/categories").with(admin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryName\":"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Request body is missing or is not valid JSON"));
    }

    // ---- 2. invalid status values

    @Test
    void invalidStatusQueryParamIsRejected() throws Exception {
        mockMvc.perform(patch("/api/admin/projects/1/status").with(admin()).param("status", "SPAM"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid value 'SPAM' for status. Allowed: DRAFT, PUBLISHED, ARCHIVED"));

        verifyNoInteractions(projectService);
    }

    @Test
    void invalidStatusPathVariableIsRejected() throws Exception {
        mockMvc.perform(get("/api/admin/projects/status/SPAM").with(admin()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid value 'SPAM' for status. Allowed: DRAFT, PUBLISHED, ARCHIVED"));
    }

    @Test
    void nonNumericIdIsRejected() throws Exception {
        mockMvc.perform(get("/api/admin/projects/abc").with(admin()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid value 'abc' for id"));
    }

    @Test
    void missingStatusParamIsRejected() throws Exception {
        mockMvc.perform(patch("/api/admin/projects/1/status").with(admin()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    // ---- 3. rejected uploads

    private static final MockMultipartFile TEXT_FILE =
            new MockMultipartFile("file", "notes.txt", "text/plain", "hello".getBytes());

    @Test
    void rejectedImageFileReturns400() throws Exception {
        when(projectImageService.uploadProjectImage(anyLong(), any(), any(), any()))
                .thenThrow(new InvalidRequestException("Only JPG, PNG and WebP images are allowed"));

        mockMvc.perform(multipart("/api/admin/projects/1/images/upload").file(TEXT_FILE).with(admin()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only JPG, PNG and WebP images are allowed"));
    }

    @Test
    void missingFilePartReturns400() throws Exception {
        mockMvc.perform(multipart("/api/admin/projects/1/images/upload").with(admin()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Required part 'file' is missing"));

        verifyNoInteractions(projectImageService);
    }

    @Test
    void oversizedUploadReturns413() throws Exception {
        when(projectService.uploadProjectCover(anyLong(), any()))
                .thenThrow(new MaxUploadSizeExceededException(10 * 1024 * 1024));

        mockMvc.perform(multipart("/api/admin/projects/1/cover").file(
                        new MockMultipartFile("file", "big.jpg", "image/jpeg", new byte[10])).with(admin()))
                .andExpect(status().isPayloadTooLarge())
                .andExpect(jsonPath("$.message").value("Image size must not exceed 10 MB"));
    }

    // ---- unknown routes were 500 too

    @Test
    void unknownRouteReturns404() throws Exception {
        mockMvc.perform(get("/api/admin/does-not-exist").with(admin()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void wrongMethodReturns405() throws Exception {
        mockMvc.perform(delete("/api/admin/projects/status/DRAFT").with(admin()))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.status").value(405));
    }
}
