package com.oastudio.api.security;

import com.oastudio.api.exception.LoginLockedException;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LoginAttemptServiceTest {

    /** Clock whose time the test moves forward. */
    static class TestClock extends Clock {
        Instant now = Instant.parse("2026-01-01T10:00:00Z");
        @Override public ZoneId getZone() { return ZoneId.of("UTC"); }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }

    private final TestClock clock = new TestClock();
    private final LoginAttemptService service = new LoginAttemptService(clock);

    private void fail(String username, int times) {
        for (int i = 0; i < times; i++) service.recordFailure(username);
    }

    @Test
    void fourFailuresDoNotLock() {
        fail("alice", 4);
        assertThatCode(() -> service.checkNotLocked("alice")).doesNotThrowAnyException();
    }

    @Test
    void fiveFailuresLockForFifteenMinutes() {
        fail("alice", 5);
        assertThatThrownBy(() -> service.checkNotLocked("alice"))
                .isInstanceOf(LoginLockedException.class);

        clock.now = clock.now.plus(Duration.ofMinutes(14));
        assertThatThrownBy(() -> service.checkNotLocked("alice"))
                .isInstanceOf(LoginLockedException.class);

        clock.now = clock.now.plus(Duration.ofMinutes(1));
        assertThatCode(() -> service.checkNotLocked("alice")).doesNotThrowAnyException();
    }

    @Test
    void lockIsCaseInsensitiveAndPerUser() {
        fail("Alice", 5);
        assertThatThrownBy(() -> service.checkNotLocked("alice"))
                .isInstanceOf(LoginLockedException.class);
        assertThatCode(() -> service.checkNotLocked("bob")).doesNotThrowAnyException();
    }

    @Test
    void successResetsFailureCount() {
        fail("alice", 4);
        service.recordSuccess("alice");
        fail("alice", 4);
        assertThatCode(() -> service.checkNotLocked("alice")).doesNotThrowAnyException();
    }

    @Test
    void counterRestartsAfterLockExpires() {
        fail("alice", 5);
        clock.now = clock.now.plus(Duration.ofMinutes(15));
        fail("alice", 1);
        assertThatCode(() -> service.checkNotLocked("alice")).doesNotThrowAnyException();
    }
}
