package com.example.j2ee_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync       // bật async
@EnableScheduling  // bật scheduled
public class J2eeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(J2eeBackendApplication.class, args);
	}

}
