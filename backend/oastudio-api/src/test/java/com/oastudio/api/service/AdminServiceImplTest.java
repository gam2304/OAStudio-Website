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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock AdminRepository adminRepository;
    @Mock PasswordEncoder passwordEncoder;
    @InjectMocks AdminServiceImpl adminService;

    private static Admin admin(Long id, String username, UserRole role) {
        Admin a = new Admin();
        a.setId(id);
        a.setUsername(username);
        a.setEmail(username + "@studio.tn");
        a.setPasswordHash("hash");
        a.setRole(role);
        return a;
    }

    @Test
    void getAllAdminsMapsWithoutPassword() {
        when(adminRepository.findAll()).thenReturn(List.of(
                admin(1L, "main", UserRole.SUPER_ADMIN),
                admin(2L, "helper", UserRole.ADMIN)));

        List<AdminResponse> result = adminService.getAllAdmins();

        assertThat(result).extracting(AdminResponse::username).containsExactly("main", "helper");
        assertThat(result).extracting(AdminResponse::role).containsExactly("SUPER_ADMIN", "ADMIN");
    }

    @Test
    void createAdminHashesPasswordAndForcesAdminRole() {
        when(adminRepository.existsByUsername("helper")).thenReturn(false);
        when(adminRepository.existsByEmail("helper@studio.tn")).thenReturn(false);
        when(passwordEncoder.encode("Secret123!")).thenReturn("encoded");
        when(adminRepository.save(any())).thenAnswer(inv -> {
            Admin a = inv.getArgument(0);
            a.setId(5L);
            return a;
        });

        AdminResponse result = adminService.createAdmin(
                new CreateAdminRequest("helper", "helper@studio.tn", "Secret123!"));

        ArgumentCaptor<Admin> saved = ArgumentCaptor.forClass(Admin.class);
        verify(adminRepository).save(saved.capture());
        assertThat(saved.getValue().getPasswordHash()).isEqualTo("encoded");
        assertThat(saved.getValue().getRole()).isEqualTo(UserRole.ADMIN);
        assertThat(result.id()).isEqualTo(5L);
        assertThat(result.role()).isEqualTo("ADMIN");
    }

    @Test
    void createAdminRejectedWhenLimitReached() {
        when(adminRepository.count()).thenReturn((long) AdminServiceImpl.MAX_ADMINS);

        assertThatThrownBy(() -> adminService.createAdmin(
                new CreateAdminRequest("helper", "helper@studio.tn", "Secret123!")))
                .isInstanceOf(OperationNotAllowedException.class)
                .hasMessageContaining("5");
        verify(adminRepository, never()).save(any());
    }

    @Test
    void createAdminRejectsDuplicateUsername() {
        when(adminRepository.existsByUsername("helper")).thenReturn(true);

        assertThatThrownBy(() -> adminService.createAdmin(
                new CreateAdminRequest("helper", "x@studio.tn", "Secret123!")))
                .isInstanceOf(DuplicateResourceException.class);
        verify(adminRepository, never()).save(any());
    }

    @Test
    void createAdminRejectsDuplicateEmail() {
        when(adminRepository.existsByUsername("helper")).thenReturn(false);
        when(adminRepository.existsByEmail("helper@studio.tn")).thenReturn(true);

        assertThatThrownBy(() -> adminService.createAdmin(
                new CreateAdminRequest("helper", "helper@studio.tn", "Secret123!")))
                .isInstanceOf(DuplicateResourceException.class);
        verify(adminRepository, never()).save(any());
    }

    @Test
    void deleteAdminRemovesRegularAdmin() {
        Admin target = admin(2L, "helper", UserRole.ADMIN);
        when(adminRepository.findById(2L)).thenReturn(Optional.of(target));

        adminService.deleteAdmin(2L);

        verify(adminRepository).delete(target);
    }

    @Test
    void deleteAdminRefusesSuperAdmin() {
        when(adminRepository.findById(1L)).thenReturn(Optional.of(admin(1L, "main", UserRole.SUPER_ADMIN)));

        assertThatThrownBy(() -> adminService.deleteAdmin(1L))
                .isInstanceOf(OperationNotAllowedException.class);
        verify(adminRepository, never()).delete(any());
    }

    @Test
    void changeOwnPasswordWithCorrectCurrentPassword() {
        Admin me = admin(2L, "helper", UserRole.ADMIN);
        when(adminRepository.findByUsername("helper")).thenReturn(Optional.of(me));
        when(passwordEncoder.matches("OldSecret1", "hash")).thenReturn(true);
        when(passwordEncoder.encode("NewSecret1")).thenReturn("newhash");

        adminService.changeOwnPassword("helper", new ChangePasswordRequest("OldSecret1", "NewSecret1"));

        assertThat(me.getPasswordHash()).isEqualTo("newhash");
        verify(adminRepository).save(me);
    }

    @Test
    void changeOwnPasswordRejectsWrongCurrentPassword() {
        when(adminRepository.findByUsername("helper")).thenReturn(Optional.of(admin(2L, "helper", UserRole.ADMIN)));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThatThrownBy(() -> adminService.changeOwnPassword(
                "helper", new ChangePasswordRequest("wrong", "NewSecret1")))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessage("Current password is incorrect");
        verify(adminRepository, never()).save(any());
    }

    @Test
    void changeOwnPasswordRejectsSamePassword() {
        when(adminRepository.findByUsername("helper")).thenReturn(Optional.of(admin(2L, "helper", UserRole.ADMIN)));
        when(passwordEncoder.matches("Same12345", "hash")).thenReturn(true);

        assertThatThrownBy(() -> adminService.changeOwnPassword(
                "helper", new ChangePasswordRequest("Same12345", "Same12345")))
                .isInstanceOf(InvalidRequestException.class);
        verify(adminRepository, never()).save(any());
    }

    @Test
    void resetPasswordOfRegularAdmin() {
        Admin target = admin(2L, "helper", UserRole.ADMIN);
        when(adminRepository.findById(2L)).thenReturn(Optional.of(target));
        when(passwordEncoder.encode("Reset1234")).thenReturn("resethash");

        adminService.resetPassword(2L, new ResetPasswordRequest("Reset1234"));

        assertThat(target.getPasswordHash()).isEqualTo("resethash");
        verify(adminRepository).save(target);
    }

    @Test
    void resetPasswordRefusesMainAdmin() {
        when(adminRepository.findById(1L)).thenReturn(Optional.of(admin(1L, "main", UserRole.SUPER_ADMIN)));

        assertThatThrownBy(() -> adminService.resetPassword(1L, new ResetPasswordRequest("Reset1234")))
                .isInstanceOf(OperationNotAllowedException.class);
        verify(adminRepository, never()).save(any());
    }

    @Test
    void deleteAdminThrowsWhenMissing() {
        when(adminRepository.findById(9L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminService.deleteAdmin(9L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
