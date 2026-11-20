package com.errorvault.record;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Converts between the API tag list and the stored comma-separated column. */
final class TagNormalizer {

    /** Maximum length of the stored column (see V2__error_record.sql). */
    static final int MAX_STORED_LENGTH = 500;

    private TagNormalizer() {
    }

    /** Trims, lowercases and removes duplicates; returns null when there are no tags. */
    static String toStored(List<String> tags) {
        if (tags == null) {
            return null;
        }
        Set<String> normalised = new LinkedHashSet<>();
        for (String tag : tags) {
            if (tag != null && !tag.isBlank()) {
                normalised.add(tag.trim().toLowerCase(Locale.ROOT));
            }
        }
        if (normalised.isEmpty()) {
            return null;
        }
        String joined = String.join(",", normalised);
        if (joined.length() > MAX_STORED_LENGTH) {
            throw new IllegalArgumentException("Tags are too long in total");
        }
        return joined;
    }

    static List<String> toList(String stored) {
        if (stored == null || stored.isBlank()) {
            return new ArrayList<>();
        }
        return new ArrayList<>(List.of(stored.split(",")));
    }
}
