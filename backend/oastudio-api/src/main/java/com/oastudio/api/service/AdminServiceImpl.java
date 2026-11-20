package com.oastudio.api.service;

import com.oastudio.api.dto.request.ChangePasswordRequest;
import com.oastudio.api.dto.request.CreateAdminRequest;
import com.oastudio.api.dto.request.ResetPasswordRequest;
import com.oastudio.api.exception.InvalidRequestException;
import com.oastudio.api.dto.response.AdminResponse;
import com.oastudio.api.entity.Admin;
import com.oastudio.api.enums.UserRole;
import com.oastudio.api.exception.DuplicateResourceException;
import com.oastudio.api.exception.OperationNotAllowedException;
import com.oastudio.api.exception.ResourceNotFoundException;
import com.oastudio.api.repository.AdminRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class
AdminServiceImpl implements AdminService {

    // Total accounts, main admin included.
    static final int MAX_ADMINS = 5;

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<AdminResponse> getAllAdmins() {

        return adminRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AdminResponse createAdmin(CreateAdminRequest request) {

        // shortcut: two simultaneous creates at 4 admins could both pass; fine with one main admin creating, add a DB lock if that changes.
        if (adminRepository.count() >= MAX_ADMINS) {
            throw new OperationNotAllowedException(
                    "Maximum of " + MAX_ADMINS + " administrators reached");
        }

        if (adminRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException(
                    "Username already exists: " + request.username());
        }

        if (adminRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException(
                    "Email already exists: " + request.email());
        }

        Admin admin = new Admin();
        admin.setUsername(request.username());
        admin.setEmail(request.email());
        admin.setPasswordHash(passwordEncoder.encode(request.password()));
        // Only regular admins can be created; there is a single main admin.
        admin.setRole(UserRole.ADMIN);

        Admin saved = adminRepository.save(admin);
        log.info("admin_created id={} username={}", saved.getId(), saved.getUsername());

        return mapToResponse(saved);
    }

    @Override
    public void deleteAdmin(Long id) {

        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Administrator not found with id: " + id));

        if (admin.getRole() == UserRole.SUPER_ADMIN) {
            throw new OperationNotAllowedException(
                    "The main administrator cannot be removed");
        }

        adminRepository.delete(admin);
        log.info("admin_deleted id={} username={}", admin.getId(), admin.getUsername());
    }

    @Override
    public void changeOwnPassword(String username, ChangePasswordRequest request) {

        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Administrator not found: " + username));

        if (!passwordEncoder.matches(request.currentPassword(), admin.getPasswordHash())) {
            throw new InvalidRequestException("Current password is incorrect");
        }

        if (request.currentPassword().equals(request.newPassword())) {
            throw new InvalidRequestException(
                    "New password must be different from the current password");
        }

        admin.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        adminRepository.save(admin);
        log.info("admin_password_changed id={}", admin.getId());
    }

    @Override
    public void resetPassword(Long id, ResetPasswordRequest request) {

        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Administrator not found with id: " + id));

        // The main admin must use change-password, which checks the current password.
        if (admin.getRole() == UserRole.SUPER_ADMIN) {
            throw new OperationNotAllowedException(
                    "Use change password for the main administrator account");
        }

        admin.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        adminRepository.save(admin);
        log.info("admin_password_reset id={}", admin.getId());
    }

    private AdminResponse mapToResponse(Admin admin) {

        return new AdminResponse(
                admin.getId(),
                admin.getUsername(),
                admin.getEmail(),
                admin.getRole().name(),
                admin.getCreatedAt()
        );
    }
}
