package com.errorvault.record;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ErrorRecordResponse(
        UUID id,
        String title,
        String errorMessage,
        String stackTrace,
        String source,
        String environment,
        String rootCause,
        String resolution,
        List<String> tags,
        Instant createdAt,
        Instant updatedAt
) {

    static ErrorRecordResponse from(ErrorRecord e) {
        return new ErrorRecordResponse(
                e.getId(),
                e.getTitle(),
                e.getErrorMessage(),
                e.getStackTrace(),
                e.getSource(),
                e.getEnvironment(),
                e.getRootCause(),
                e.getResolution(),
                TagNormalizer.toList(e.getTags()),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
