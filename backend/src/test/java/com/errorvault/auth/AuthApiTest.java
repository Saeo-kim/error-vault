package com.errorvault.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "app.auth.password=correct-horse-battery")
class AuthApiTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private SessionTokens tokens;

    @Test
    void apiRequiresSignInButHealthAndAuthStatusArePublic() throws Exception {
        mvc.perform(get("/api/errors")).andExpect(status().isUnauthorized());
        mvc.perform(get("/actuator/health")).andExpect(status().isOk());
        mvc.perform(get("/api/auth/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authRequired").value(true))
                .andExpect(jsonPath("$.authenticated").value(false));
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"nope\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void correctPasswordSetsHttpOnlySessionCookieThatUnlocksTheApi() throws Exception {
        MvcResult login = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"correct-horse-battery\"}"))
                .andExpect(status().isNoContent())
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("ev_session=")))
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("HttpOnly")))
                .andReturn();

        Cookie session = login.getResponse().getCookie("ev_session");
        assertThat(session).isNotNull();

        mvc.perform(get("/api/errors").cookie(session)).andExpect(status().isOk());
        mvc.perform(get("/api/auth/status").cookie(session))
                .andExpect(jsonPath("$.authenticated").value(true));
    }

    @Test
    void tamperedOrExpiredTokensAreRejected() throws Exception {
        String valid = tokens.create(java.time.Instant.now());
        String tampered = valid.substring(0, valid.indexOf('.') + 1) + "forged";
        mvc.perform(get("/api/errors").cookie(new Cookie("ev_session", tampered)))
                .andExpect(status().isUnauthorized());

        String expired = tokens.create(java.time.Instant.now().minusSeconds(60L * 60 * 24 * 60));
        mvc.perform(get("/api/errors").cookie(new Cookie("ev_session", expired)))
                .andExpect(status().isUnauthorized());
    }
}
