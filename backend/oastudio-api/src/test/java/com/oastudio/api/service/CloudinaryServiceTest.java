package com.oastudio.api.service;

import com.oastudio.api.exception.InvalidRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** Validation runs before any Cloudinary call, so no client is needed. */
class CloudinaryServiceTest {

    private final CloudinaryService service = new CloudinaryService(null);

    @Test
    void rejectsNonImage() {
        assertThatThrownBy(() -> service.uploadImage(
                new MockMultipartFile("file", "a.txt", "text/plain", "x".getBytes()), 1L))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessage("Only JPG, PNG and WebP images are allowed");
    }

    @Test
    void rejectsEmptyFile() {
        assertThatThrownBy(() -> service.uploadImage(
                new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[0]), 1L))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void rejectsFileOver10Mb() {
        assertThatThrownBy(() -> service.uploadImage(
                new MockMultipartFile("file", "a.jpg", "image/jpeg", new byte[10 * 1024 * 1024 + 1]), 1L))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessage("Image size must not exceed 10 MB");
    }
}
