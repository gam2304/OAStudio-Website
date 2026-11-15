
package com.oastudio.api.repository;

import com.oastudio.api.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    List<ContactMessage> findByStatusOrderByCreatedAtDesc(String status);

    List<ContactMessage> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);
}
