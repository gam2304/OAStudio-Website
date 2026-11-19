package com.oastudio.api.security;

import com.oastudio.api.exception.TooManyMessagesException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;

/**
 * Allows at most 5 contact messages per IP address in any 24-hour window, so one visitor or bot can't flood the inbox.
 */
// shortcut: in-memory, so counts reset on restart and are not shared between instances; move to the DB or Redis if the API ever runs on more than one instance.
@Component
public class ContactRateLimiter {

    static final int MAX_MESSAGES = 5;
    static final Duration WINDOW = Duration.ofHours(24);

    private final Map<String, Deque<Instant>> sent = new HashMap<>();
    private final Clock clock;

    @Autowired
    public ContactRateLimiter() {
        this(Clock.systemUTC());
    }

    ContactRateLimiter(Clock clock) {
        this.clock = clock;
    }

    /** Records one message from {@code ip}, or throws if that IP already sent the maximum in the last 24 hours. */
    public synchronized void acquire(String ip) {
        Instant now = clock.instant();
        Instant cutoff = now.minus(WINDOW);
        // Forget timestamps (and whole IPs) older than the window so the map can't grow forever
        sent.values().forEach(times -> {
            while (!times.isEmpty() && !times.peekFirst().isAfter(cutoff)) {
                times.pollFirst();
            }
        });
        sent.values().removeIf(Deque::isEmpty);

        Deque<Instant> times = sent.computeIfAbsent(ip, k -> new ArrayDeque<>());
        if (times.size() >= MAX_MESSAGES) {
            throw new TooManyMessagesException();
        }
        times.addLast(now);
    }
}
