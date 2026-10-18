package com.example.j2ee_backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntime(RuntimeException ex) {
        if (ex.getMessage().contains("Không tìm thấy chuyên khoa")) {
            return ResponseEntity.status(404).body(ex.getMessage());
        }
        return ResponseEntity.status(500).body("Internal Server Error");
    }
}

