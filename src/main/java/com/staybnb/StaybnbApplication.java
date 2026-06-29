package com.staybnb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class StaybnbApplication {
    public static void main(String[] args) {
        SpringApplication.run(StaybnbApplication.class, args);
    }
}
