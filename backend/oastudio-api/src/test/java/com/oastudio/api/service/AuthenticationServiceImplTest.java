package com.oastudio.api.service;

import com.oastudio.api.dto.request.AdminRequest;
import com.oastudio.api.exception.LoginLockedException;
import com.oastudio.api.security.LoginAttemptService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.jwt.JwtEncoder;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceImplTest {

    @Mock AuthenticationManager authenticationManager;
    @Mock JwtEncoder jwtEncoder;
    @Mock LoginAttemptService loginAttemptService;
    @InjectMocks AuthenticationServiceImpl authenticationService;

    @Test
    void lockedUserIsRejectedBeforePasswordCheck() {
        doThrow(new LoginLockedException()).when(loginAttemptService).checkNotLocked("alice");

        assertThatThrownBy(() -> authenticationService.login(new AdminRequest("alice", "pw")))
                .isInstanceOf(LoginLockedException.class);
        verifyNoInteractions(authenticationManager);
    }

    @Test
    void wrongPasswordIsRecordedAsFailure() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> authenticationService.login(new AdminRequest("alice", "pw")))
                .isInstanceOf(BadCredentialsException.class);
        verify(loginAttemptService).recordFailure("alice");
        verify(loginAttemptService, never()).recordSuccess(any());
    }
}
