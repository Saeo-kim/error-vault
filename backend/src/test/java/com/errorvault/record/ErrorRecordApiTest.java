package com.errorvault.record;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ErrorRecordApiTest {

    @Autowired
    private MockMvc mvc;

    private static final String NPE_BODY = """
            {"title":"NullPointerException in UserService",
             "errorMessage":"java.lang.NullPointerException: user is null",
             "stackTrace":"at UserService.load(UserService.java:42)",
             "source":"Java",
             "environment":"local",
             "rootCause":"Lookup returned null for unknown id",
             "resolution":"Return Optional and handle empty case",
             "tags":["NPE", " spring ", "npe"]}
            """;

    @Test
    void createReturns201WithLocationAndNormalisedTags() throws Exception {
        mvc.perform(post("/api/errors").contentType(MediaType.APPLICATION_JSON).content(NPE_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("/api/errors/")))
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.title").value("NullPointerException in UserService"))
                .andExpect(jsonPath("$.tags[0]").value("npe"))
                .andExpect(jsonPath("$.tags[1]").value("spring"))
                .andExpect(jsonPath("$.tags.length()").value(2))
                .andExpect(jsonPath("$.createdAt").isNotEmpty());
    }

    @Test
    void getReturnsCreatedRecordAndMissingIdIs404() throws Exception {
        String id = idOf(create(NPE_BODY));

        mvc.perform(get("/api/errors/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resolution").value("Return Optional and handle empty case"));

        mvc.perform(get("/api/errors/00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void listIsNewestFirst() throws Exception {
        create(body("First error", "alpha"));
        create(body("Second error", "beta"));

        mvc.perform(get("/api/errors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Second error"))
                .andExpect(jsonPath("$[1].title").value("First error"));
    }

    @Test
    void searchMatchesTitleMessageAndTagsCaseInsensitively() throws Exception {
        create(NPE_BODY);
        create(body("Connection refused", "network"));

        mvc.perform(get("/api/errors").param("q", "nullpointer"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("NullPointerException in UserService"));

        mvc.perform(get("/api/errors").param("q", "USER is NULL"))
                .andExpect(jsonPath("$.length()").value(1));

        mvc.perform(get("/api/errors").param("q", "network"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Connection refused"));
    }

    @Test
    void tagFilterMatchesWholeTagsOnly() throws Exception {
        create(NPE_BODY);
        create(body("Other", "npe2"));

        mvc.perform(get("/api/errors").param("tag", "npe"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("NullPointerException in UserService"));

        mvc.perform(get("/api/errors").param("tag", "NPE2"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Other"));
    }

    @Test
    void wildcardCharactersInSearchAreTreatedLiterally() throws Exception {
        create(body("Disk 100% full", "disk"));
        create(body("Unrelated", "misc"));

        mvc.perform(get("/api/errors").param("q", "100%"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Disk 100% full"));

        mvc.perform(get("/api/errors").param("q", "%"))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void updateReplacesFieldsAndDeleteRemovesRecord() throws Exception {
        String id = idOf(create(NPE_BODY));

        mvc.perform(put("/api/errors/" + id).contentType(MediaType.APPLICATION_JSON)
                        .content(body("Renamed error", "fixed")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Renamed error"))
                .andExpect(jsonPath("$.stackTrace").doesNotExist())
                .andExpect(jsonPath("$.tags[0]").value("fixed"));

        mvc.perform(delete("/api/errors/" + id))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/errors/" + id))
                .andExpect(status().isNotFound());

        mvc.perform(delete("/api/errors/" + id))
                .andExpect(status().isNotFound());
    }

    @Test
    void validationErrorsReturn400WithFieldMessages() throws Exception {
        mvc.perform(post("/api/errors").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"  ","errorMessage":"","tags":[]}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.title").isNotEmpty())
                .andExpect(jsonPath("$.fields.errorMessage").isNotEmpty());
    }

    @Test
    void titleLongerThan200CharactersIsRejected() throws Exception {
        String longTitle = "x".repeat(201);
        mvc.perform(post("/api/errors").contentType(MediaType.APPLICATION_JSON)
                        .content(body(longTitle, "t")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.title").isNotEmpty());
    }

    @Test
    void tooManyTagsAreRejected() throws Exception {
        String tags = "\"a\",\"b\",\"c\",\"d\",\"e\",\"f\",\"g\",\"h\",\"i\",\"j\",\"k\"";
        mvc.perform(post("/api/errors").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"T\",\"errorMessage\":\"M\",\"tags\":[" + tags + "]}"))
                .andExpect(status().isBadRequest());
    }

    private MvcResult create(String json) throws Exception {
        return mvc.perform(post("/api/errors").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andReturn();
    }

    private static String idOf(MvcResult result) throws Exception {
        String json = result.getResponse().getContentAsString();
        return com.jayway.jsonpath.JsonPath.read(json, "$.id");
    }

    private static String body(String title, String tag) {
        return """
                {"title":"%s","errorMessage":"message for %s","tags":["%s"]}
                """.formatted(title, title, tag);
    }
}
