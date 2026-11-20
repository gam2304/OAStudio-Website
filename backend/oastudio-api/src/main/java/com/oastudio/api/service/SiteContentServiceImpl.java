package com.oastudio.api.service;

import com.oastudio.api.entity.SiteSetting;
import com.oastudio.api.exception.InvalidRequestException;
import com.oastudio.api.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SiteContentServiceImpl implements SiteContentService {

    static final String HOME_KEY = "home";
    // Text and image URLs only; far above any real landing page
    static final int MAX_CONTENT_LENGTH = 200_000;

    private final SiteSettingRepository siteSettingRepository;
    private final CloudinaryService cloudinaryService;
    private final JsonMapper jsonMapper;

    @Override
    @Transactional(readOnly = true)
    public JsonNode getHomeContent() {
        return siteSettingRepository.findById(HOME_KEY)
                .map(setting -> jsonMapper.readTree(setting.getContent()))
                .orElseGet(jsonMapper::createObjectNode);
    }

    @Override
    @Transactional
    public JsonNode saveHomeContent(JsonNode content) {
        if (content == null || !content.isObject()) {
            throw new InvalidRequestException("Landing page content must be a JSON object");
        }
        String json = jsonMapper.writeValueAsString(content);
        if (json.length() > MAX_CONTENT_LENGTH) {
            throw new InvalidRequestException("Landing page content is too large");
        }

        SiteSetting setting = siteSettingRepository.findById(HOME_KEY).orElseGet(() -> {
            SiteSetting created = new SiteSetting();
            created.setKey(HOME_KEY);
            return created;
        });
        setting.setContent(json);
        siteSettingRepository.save(setting);
        return content;
    }

    @Override
    public Map<String, String> uploadImage(MultipartFile file) {
        try {
            Map<?, ?> result = cloudinaryService.uploadImage(file, "oastudio/site");
            return Map.of("url", String.valueOf(result.get("secure_url")));
        } catch (IOException e) {
            throw new IllegalStateException("Image upload failed", e);
        }
    }
}
