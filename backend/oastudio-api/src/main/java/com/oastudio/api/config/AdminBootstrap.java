
package com.oastudio.api.config;

import com.oastudio.api.entity.Admin;
import com.oastudio.api.enums.UserRole;
import com.oastudio.api.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

@Configuration
@ConditionalOnProperty(
        prefix = "app.admin.bootstrap",
        name = "enabled",
        havingValue = "true"
)
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrap {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap.username}")
    private String username;

    @Value("${app.admin.bootstrap.email}")
    private String email;

    @Value("${app.admin.bootstrap.password}")
    private String password;

    @Bean
    public CommandLineRunner initializeAdmin() {
        return args -> {

            // Do not create another administrator if one already exists.
            if (adminRepository.count() > 0) {
                log.info("Administrator already exists. Bootstrap skipped.");
                return;
            }

            // Check that all required credentials are provided.
            if (!StringUtils.hasText(username)
                    || !StringUtils.hasText(email)
                    || !StringUtils.hasText(password)) {
                throw new IllegalStateException(
                        "Admin bootstrap credentials are missing."
                );
            }

            Admin admin = new Admin();

            admin.setUsername(username);
            admin.setEmail(email);
            admin.setPasswordHash(passwordEncoder.encode(password));
            admin.setRole(UserRole.ADMIN);

            adminRepository.save(admin);

            log.info("Initial administrator created successfully.");
        };
    }
}
