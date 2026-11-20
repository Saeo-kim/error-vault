package com.errorvault.record;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ErrorRecordRepository extends JpaRepository<ErrorRecord, UUID> {

    /**
     * Case-insensitive search. Both patterns are always supplied (use "%" for "no filter"),
     * which avoids null-parameter typing issues on PostgreSQL.
     *
     * @param textPattern  LIKE pattern matched against title, error message and tags
     * @param tagPattern   LIKE pattern matched against the delimited tag list, e.g. "%,npe,%"
     */
    @Query("""
            select e from ErrorRecord e
            where (lower(e.title) like :textPattern escape '!'
                or lower(e.errorMessage) like :textPattern escape '!'
                or lower(coalesce(e.tags, '')) like :textPattern escape '!')
              and lower(',' || coalesce(e.tags, '') || ',') like :tagPattern escape '!'
            order by e.createdAt desc
            """)
    List<ErrorRecord> search(@Param("textPattern") String textPattern, @Param("tagPattern") String tagPattern);
}
