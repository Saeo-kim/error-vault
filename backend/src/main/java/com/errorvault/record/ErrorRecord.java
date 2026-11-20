package com.errorvault.record;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "error_record")
public class ErrorRecord {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "error_message", nullable = false, columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    @Column(length = 100)
    private String source;

    @Column(length = 100)
    private String environment;

    @Column(name = "root_cause", columnDefinition = "TEXT")
    private String rootCause;

    @Column(columnDefinition = "TEXT")
    private String resolution;

    /** Normalised comma-separated lowercase tags, e.g. "npe,spring,build". */
    @Column(length = 500)
    private String tags;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public ErrorRecord() {
        this.id = UUID.randomUUID();
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public String getStackTrace() { return stackTrace; }
    public void setStackTrace(String stackTrace) { this.stackTrace = stackTrace; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public String getRootCause() { return rootCause; }
    public void setRootCause(String rootCause) { this.rootCause = rootCause; }
    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
