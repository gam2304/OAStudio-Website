package com.oastudio.api.exception;

public class LoginLockedException extends RuntimeException {

    public LoginLockedException() {
        super("Too many failed login attempts. Try again in 15 minutes.");
    }
}
