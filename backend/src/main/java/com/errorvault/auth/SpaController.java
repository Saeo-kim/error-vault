package com.errorvault.auth;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Serves the React single-page app for client-side routes (e.g. /errors/123). */
@Controller
public class SpaController {

    @GetMapping({"/", "/errors/new", "/errors/{id}", "/errors/{id}/edit"})
    public String index() {
        return "forward:/index.html";
    }
}
