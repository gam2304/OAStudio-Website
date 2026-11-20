package com.oastudio.api.security;

import com.oastudio.api.exception.LoginLockedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Locks a username for 15 minutes after 5 consecutive failed logins.
 * Unknown usernames are tracked too, so a lock does not reveal whether an account exists.
 */
// shortcut: in-memory, so locks reset on restart and are not shared between instances; move to the DB or Redis if the API ever runs on more than one instance.
@Component
public class LoginAttemptService {

    static final int MAX_FAILURES = 5;
    static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private record Attempts(int failures, Instant lockedUntil) {}

    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();
    private final Clock clock;

    @Autowired
    public LoginAttemptService() {
        this(Clock.systemUTC());
    }

    LoginAttemptService(Clock clock) {
        this.clock = clock;
    }

    public void checkNotLocked(String username) {
        Attempts a = attempts.get(key(username));
        if (a != null && a.lockedUntil() != null && clock.instant().isBefore(a.lockedUntil())) {
            throw new LoginLockedException();
        }
    }

    public void recordFailure(String username) {
        Instant now = clock.instant();
        attempts.compute(key(username), (k, a) -> {
            // A finished lock starts a fresh count.
            int failures = (a == null || (a.lockedUntil() != null && !now.isBefore(a.lockedUntil())))
                    ? 1 : a.failures() + 1;
            return new Attempts(failures, failures >= MAX_FAILURES ? now.plus(LOCK_DURATION) : null);
        });
    }

    public void recordSuccess(String username) {
        attempts.remove(key(username));
    }

    private static String key(String username) {
        return username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
    }
}
