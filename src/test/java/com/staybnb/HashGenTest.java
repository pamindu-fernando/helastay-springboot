package com.staybnb;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGenTest {
    @Test
    public void generateHash() {
        System.out.println("HASH_OUTPUT=" + new BCryptPasswordEncoder().encode("password123"));
    }
}
