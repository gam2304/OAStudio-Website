package com.oastudio.api.exception;

public class TooManyMessagesException extends RuntimeException {

    public TooManyMessagesException() {
        super("Too many messages sent today. Please try again tomorrow or contact us by phone.");
    }
}
