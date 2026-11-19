package com.oastudio.api.service;

import com.oastudio.api.entity.SiteSetting;
import com.oastudio.api.exception.InvalidRequestException;
import com.oastudio.api.repository.SiteSettingRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import tools.jackson.databind.json.JsonMapper;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SiteContentServiceImplTest {

    private final SiteSettingRepository repository = mock(SiteSettingRepository.class);
    private final JsonMapper jsonMapper = JsonMapper.builder().build();
    private final SiteContentServiceImpl service = new SiteContentServiceImpl(repository, null, jsonMapper);

    @Test
    void unsavedContentIsAnEmptyObject() {
        when(repository.findById("home")).thenReturn(Optional.empty());
        assertThat(service.getHomeContent().isObject()).isTrue();
        assertThat(service.getHomeContent().isEmpty()).isTrue();
    }

    @Test
    void savesAndReadsBackTheDocument() {
        when(repository.findById("home")).thenReturn(Optional.empty());
        service.saveHomeContent(jsonMapper.readTree("{\"hero\":{\"headline\":{\"fr\":\"Bonjour\"}}}"));

        ArgumentCaptor<SiteSetting> saved = ArgumentCaptor.forClass(SiteSetting.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getKey()).isEqualTo("home");

        when(repository.findById("home")).thenReturn(Optional.of(saved.getValue()));
        assertThat(service.getHomeContent().at("/hero/headline/fr").asString()).isEqualTo("Bonjour");
    }

    @Test
    void rejectsNonObjectContent() {
        assertThatThrownBy(() -> service.saveHomeContent(jsonMapper.readTree("[1,2]")))
                .isInstanceOf(InvalidRequestException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void rejectsOversizedContent() {
        String big = "{\"x\":\"" + "a".repeat(SiteContentServiceImpl.MAX_CONTENT_LENGTH) + "\"}";
        assertThatThrownBy(() -> service.saveHomeContent(jsonMapper.readTree(big)))
                .isInstanceOf(InvalidRequestException.class);
    }
}
