package com.errorvault.record;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/errors")
public class ErrorRecordController {

    private final ErrorRecordService service;

    public ErrorRecordController(ErrorRecordService service) {
        this.service = service;
    }

    @GetMapping
    public List<ErrorRecordResponse> list(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "tag", required = false) String tag) {
        return service.search(q, tag);
    }

    @PostMapping
    public ResponseEntity<ErrorRecordResponse> create(@Valid @RequestBody ErrorRecordRequest request) {
        ErrorRecordResponse created = service.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    public ErrorRecordResponse get(@PathVariable UUID id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public ErrorRecordResponse update(@PathVariable UUID id, @Valid @RequestBody ErrorRecordRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
