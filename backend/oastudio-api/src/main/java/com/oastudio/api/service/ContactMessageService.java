
package com.oastudio.api.service;

import com.oastudio.api.dto.request.ContactMessageRequest;
import com.oastudio.api.dto.response.ContactMessageResponse;
import com.oastudio.api.enums.MessageStatus;

import java.util.List;

public interface ContactMessageService {

    // Public contact form
    ContactMessageResponse createMessage(ContactMessageRequest request);

    // Admin message management
    List<ContactMessageResponse> getAllMessages();

    ContactMessageResponse getMessageById(Long id);

    List<ContactMessageResponse> getMessagesByStatus(MessageStatus status);

    ContactMessageResponse updateMessageStatus(Long id, MessageStatus status);

    void deleteMessage(Long id);

    long countNewMessages();
}
