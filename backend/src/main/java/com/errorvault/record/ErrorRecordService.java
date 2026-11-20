package com.errorvault.record;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ErrorRecordService {

    private final ErrorRecordRepository repository;

    public ErrorRecordService(ErrorRecordRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ErrorRecordResponse> search(String q, String tag) {
        String textPattern = likePattern(q);
        String tagPattern = tagPattern(tag);
        return repository.search(textPattern, tagPattern).stream()
                .map(ErrorRecordResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ErrorRecordResponse get(UUID id) {
        return ErrorRecordResponse.from(find(id));
    }

    public ErrorRecordResponse create(ErrorRecordRequest request) {
        ErrorRecord record = new ErrorRecord();
        apply(record, request);
        return ErrorRecordResponse.from(repository.save(record));
    }

    public ErrorRecordResponse update(UUID id, ErrorRecordRequest request) {
        ErrorRecord record = find(id);
        apply(record, request);
        return ErrorRecordResponse.from(repository.save(record));
    }

    public void delete(UUID id) {
        repository.delete(find(id));
    }

    private ErrorRecord find(UUID id) {
        return repository.findById(id).orElseThrow(() -> new ErrorRecordNotFoundException(id));
    }

    private static void apply(ErrorRecord record, ErrorRecordRequest request) {
        record.setTitle(request.title().trim());
        record.setErrorMessage(request.errorMessage());
        record.setStackTrace(blankToNull(request.stackTrace()));
        record.setSource(blankToNull(request.source()));
        record.setEnvironment(blankToNull(request.environment()));
        record.setRootCause(blankToNull(request.rootCause()));
        record.setResolution(blankToNull(request.resolution()));
        record.setTags(TagNormalizer.toStored(request.tags()));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    /** "%" when there is no query, otherwise a contains-pattern with LIKE wildcards escaped. */
    static String likePattern(String q) {
        if (q == null || q.isBlank()) {
            return "%";
        }
        return "%" + escapeLike(q.trim().toLowerCase(Locale.ROOT)) + "%";
    }

    /** Matches one whole tag inside the delimited column, e.g. "%,npe,%". */
    static String tagPattern(String tag) {
        if (tag == null || tag.isBlank()) {
            return "%";
        }
        return "%," + escapeLike(tag.trim().toLowerCase(Locale.ROOT)) + ",%";
    }

    static String escapeLike(String value) {
        return value.replace("!", "!!").replace("%", "!%").replace("_", "!_");
    }
}
