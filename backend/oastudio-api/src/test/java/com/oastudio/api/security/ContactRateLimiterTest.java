package com.oastudio.api.security;

import com.oastudio.api.exception.TooManyMessagesException;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ContactRateLimiterTest {

    private Instant now = Instant.parse("2026-01-01T10:00:00Z");
    private final ContactRateLimiter limiter = new ContactRateLimiter(new Clock() {
        @Override public ZoneOffset getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(java.time.ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    });

    private void sendFive(String ip) {
        for (int i = 0; i < ContactRateLimiter.MAX_MESSAGES; i++) {
            limiter.acquire(ip);
        }
    }

    @Test
    void sixthMessageInADayIsRejected() {
        sendFive("1.1.1.1");
        assertThatThrownBy(() -> limiter.acquire("1.1.1.1")).isInstanceOf(TooManyMessagesException.class);
    }

    @Test
    void otherIpsAreNotAffected() {
        sendFive("1.1.1.1");
        assertThatCode(() -> limiter.acquire("2.2.2.2")).doesNotThrowAnyException();
    }

    @Test
    void allowedAgainOnce24HoursHavePassed() {
        sendFive("1.1.1.1");
        now = now.plus(Duration.ofHours(24)).plusSeconds(1);
        assertThatCode(() -> limiter.acquire("1.1.1.1")).doesNotThrowAnyException();
    }

    @Test
    void windowSlidesRatherThanResettingAtMidnight() {
        sendFive("1.1.1.1");
        now = now.plus(Duration.ofHours(14)); // next calendar day, but within 24 hours
        assertThatThrownBy(() -> limiter.acquire("1.1.1.1")).isInstanceOf(TooManyMessagesException.class);
    }
}
