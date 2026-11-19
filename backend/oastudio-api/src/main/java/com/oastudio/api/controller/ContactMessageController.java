
package com.oastudio.api.controller;

import com.oastudio.api.security.ContactRateLimiter;
import jakarta.servlet.http.HttpServletRequest;

import com.oastudio.api.dto.request.ContactMessageRequest;
import com.oastudio.api.dto.response.ContactMessageResponse;
import com.oastudio.api.enums.MessageStatus;
import com.oastudio.api.service.ContactMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ContactMessageController {

    private final ContactMessageService contactMessageService;
    private final ContactRateLimiter contactRateLimiter;

    // PUBLIC: Submit a contact message
    @PostMapping("/api/contact-messages")
    public ResponseEntity<ContactMessageResponse> createMessage(
            @Valid @RequestBody ContactMessageRequest request,
            HttpServletRequest httpRequest) {

        // Remote address of the TCP connection; behind a reverse proxy, enable server.forward-headers-strategy
        contactRateLimiter.acquire(httpRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contactMessageService.createMessage(request));
    }

    // ADMIN: Get all messages
    @GetMapping("/api/admin/contact-messages")
    public ResponseEntity<List<ContactMessageResponse>> getAllMessages() {

        return ResponseEntity.ok(
                contactMessageService.getAllMessages());
    }

    // ADMIN: Get message by ID
    @GetMapping("/api/admin/contact-messages/{id}")
    public ResponseEntity<ContactMessageResponse> getMessageById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                contactMessageService.getMessageById(id));
    }

    // ADMIN: Filter messages by status
    @GetMapping("/api/admin/contact-messages/status/{status}")
    public ResponseEntity<List<ContactMessageResponse>> getMessagesByStatus(
            @PathVariable MessageStatus status) {

        return ResponseEntity.ok(
                contactMessageService.getMessagesByStatus(status));
    }

    // ADMIN: Update message status
    @PatchMapping("/api/admin/contact-messages/{id}/status")
    public ResponseEntity<ContactMessageResponse> updateMessageStatus(
            @PathVariable Long id,
            @RequestParam MessageStatus status) {

        return ResponseEntity.ok(
                contactMessageService.updateMessageStatus(id, status));
    }

    // ADMIN: Delete message
    @DeleteMapping("/api/admin/contact-messages/{id}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long id) {

        contactMessageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }

    // ADMIN: Count new messages
    @GetMapping("/api/admin/contact-messages/count/new")
    public ResponseEntity<Long> countNewMessages() {

        return ResponseEntity.ok(
                contactMessageService.countNewMessages());
    }
}
