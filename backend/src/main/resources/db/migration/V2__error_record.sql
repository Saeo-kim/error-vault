-- Phase 2 MVP: stores one captured error with its context.
CREATE TABLE error_record (
    id            UUID                      PRIMARY KEY,
    title         VARCHAR(200)              NOT NULL,
    error_message TEXT                      NOT NULL,
    stack_trace   TEXT,
    source        VARCHAR(100),
    environment   VARCHAR(100),
    root_cause    TEXT,
    resolution    TEXT,
    tags          VARCHAR(500),
    created_at    TIMESTAMP WITH TIME ZONE  NOT NULL,
    updated_at    TIMESTAMP WITH TIME ZONE  NOT NULL
);

CREATE INDEX idx_error_record_created_at ON error_record (created_at DESC);
