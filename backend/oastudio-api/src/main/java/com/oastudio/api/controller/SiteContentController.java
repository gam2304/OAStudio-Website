package com.oastudio.api.controller;

import com.oastudio.api.service.SiteContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SiteContentController {

    private final SiteContentService siteContentService;

    // Public: landing page content (sections, texts, images, selected projects)
    @GetMapping("/api/public/site/home")
    public ResponseEntity<JsonNode> getHomeContent() {
        return ResponseEntity.ok(siteContentService.getHomeContent());
    }

    // Admin: replace landing page content
    @PutMapping("/api/admin/site/home")
    public ResponseEntity<JsonNode> saveHomeContent(@RequestBody JsonNode content) {
        return ResponseEntity.ok(siteContentService.saveHomeContent(content));
    }

    // Admin: upload an image for the landing page
    @PostMapping("/api/admin/site/images")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(siteContentService.uploadImage(file));
    }
}
