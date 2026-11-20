
package com.oastudio.api.security;

import com.oastudio.api.entity.Admin;
import com.oastudio.api.enums.UserRole;
import com.oastudio.api.repository.AdminRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AdminRepository adminRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Administrator not found: " + username
                ));

        return User.builder()
                .username(admin.getUsername())
                .password(admin.getPasswordHash())
                // SUPER_ADMIN also holds ADMIN so it keeps access to /api/admin/**
                .roles(admin.getRole() == UserRole.SUPER_ADMIN
                        ? new String[] {"ADMIN", "SUPER_ADMIN"}
                        : new String[] {admin.getRole().name()})
                .build();
    }
}
