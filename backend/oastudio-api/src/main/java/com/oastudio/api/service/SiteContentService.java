package com.oastudio.api.service;

import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;

import java.util.Map;

public interface SiteContentService {

    /** The saved landing page content, or an empty object when the admin has not edited it yet. */
    JsonNode getHomeContent();

    JsonNode saveHomeContent(JsonNode content);

    /** Uploads a landing page image and returns its {@code url}. */
    Map<String, String> uploadImage(MultipartFile file);
}
