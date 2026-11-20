package com.errorvault.record;

import java.util.UUID;

public class ErrorRecordNotFoundException extends RuntimeException {

    public ErrorRecordNotFoundException(UUID id) {
        super("Error record not found: " + id);
    }
}
