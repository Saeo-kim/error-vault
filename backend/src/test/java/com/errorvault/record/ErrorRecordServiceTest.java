package com.errorvault.record;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

class ErrorRecordServiceTest {

    @Test
    void likePatternIsWildcardWhenNoQuery() {
        assertThat(ErrorRecordService.likePattern(null)).isEqualTo("%");
        assertThat(ErrorRecordService.likePattern("   ")).isEqualTo("%");
    }

    @Test
    void likePatternLowercasesAndEscapesWildcards() {
        assertThat(ErrorRecordService.likePattern(" Disk_100% ")).isEqualTo("%disk!_100!%%");
        assertThat(ErrorRecordService.likePattern("a!b")).isEqualTo("%a!!b%");
    }

    @Test
    void tagPatternMatchesWholeTags() {
        assertThat(ErrorRecordService.tagPattern("NPE")).isEqualTo("%,npe,%");
        assertThat(ErrorRecordService.tagPattern(null)).isEqualTo("%");
    }

    @Test
    void tagNormalizerTrimsLowercasesDeduplicatesAndRejectsOverlong() {
        assertThat(TagNormalizer.toStored(List.of(" A ", "a", "", "B"))).isEqualTo("a,b");
        assertThat(TagNormalizer.toStored(List.of(" ", ""))).isNull();
        assertThat(TagNormalizer.toList("a,b")).containsExactly("a", "b");
        assertThat(TagNormalizer.toList(null)).isEmpty();

        String overlong = "x".repeat(40) + ",";
        List<String> tags = List.of("a".repeat(40) + "1", "b".repeat(40) + "2", "c".repeat(40) + "3",
                "d".repeat(40) + "4", "e".repeat(40) + "5", "f".repeat(40) + "6",
                "g".repeat(40) + "7", "h".repeat(40) + "8", "i".repeat(40) + "9", "j".repeat(40) + "0",
                "k".repeat(40) + "1", "l".repeat(40) + "2", "m".repeat(40) + "3");
        assertThatThrownBy(() -> TagNormalizer.toStored(tags)).isInstanceOf(IllegalArgumentException.class);
    }
}
