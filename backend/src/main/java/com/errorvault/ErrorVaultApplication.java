package com.errorvault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.errorvault.auth.AuthProperties;

@SpringBootApplication
@EnableConfigurationProperties(AuthProperties.class)
public class ErrorVaultApplication {

    public static void main(String[] args) {
        SpringApplication.run(ErrorVaultApplication.class, args);
    }
}
