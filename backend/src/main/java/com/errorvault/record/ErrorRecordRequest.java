package com.errorvault.record;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Body for creating or replacing an error record. */
public record ErrorRecordRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 10000) String errorMessage,
        @Size(max = 50000) String stackTrace,
        @Size(max = 100) String source,
        @Size(max = 100) String environment,
        @Size(max = 5000) String rootCause,
        @Size(max = 5000) String resolution,
        @Size(max = 10) List<@Size(min = 1, max = 40) String> tags
) {
}
