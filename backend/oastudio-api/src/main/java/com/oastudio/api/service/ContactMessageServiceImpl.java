
package com.oastudio.api.service;

import com.oastudio.api.dto.request.ContactMessageRequest;
import com.oastudio.api.dto.response.ContactMessageResponse;
import com.oastudio.api.entity.ContactMessage;
import com.oastudio.api.enums.MessageStatus;
import com.oastudio.api.exception.ResourceNotFoundException;
import com.oastudio.api.repository.ContactMessageRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ContactMessageServiceImpl implements ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    @Override
    public ContactMessageResponse createMessage(ContactMessageRequest request) {

        ContactMessage message = new ContactMessage();

        message.setSenderName(request.senderName());
        message.setSenderEmail(request.senderEmail());
        message.setSubject(request.subject());
        message.setMessage(request.message());
        message.setStatus(MessageStatus.NEW);

        ContactMessage savedMessage = contactMessageRepository.save(message);

        return mapToResponse(savedMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactMessageResponse> getAllMessages() {

        return contactMessageRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ContactMessageResponse getMessageById(Long id) {

        ContactMessage message = findMessageById(id);

        return mapToResponse(message);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactMessageResponse> getMessagesByStatus(MessageStatus status) {

        return contactMessageRepository.findByStatusOrderByCreatedAtDesc(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ContactMessageResponse updateMessageStatus(Long id, MessageStatus status) {

        ContactMessage message = findMessageById(id);

        message.setStatus(status);

        ContactMessage updatedMessage = contactMessageRepository.save(message);

        return mapToResponse(updatedMessage);
    }

    @Override
    public void deleteMessage(Long id) {

        ContactMessage message = findMessageById(id);

        contactMessageRepository.delete(message);
    }

    @Override
    @Transactional(readOnly = true)
    public long countNewMessages() {

        return contactMessageRepository.countByStatus(MessageStatus.NEW);
    }

    private ContactMessage findMessageById(Long id) {

        return contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Contact message not found with ID: " + id
                ));
    }

    private ContactMessageResponse mapToResponse(ContactMessage message) {

        return new ContactMessageResponse(
                message.getId(),
                message.getSenderName(),
                message.getSenderEmail(),
                message.getSubject(),
                message.getMessage(),
                message.getStatus().name(),
                message.getCreatedAt()
        );
    }
}
