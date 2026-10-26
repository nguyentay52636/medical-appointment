package com.example.j2ee_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private Path resolveDirectory(String folder) {
        Path direct = Paths.get(folder).toAbsolutePath().normalize();
        if (Files.exists(direct)) return direct;
        Path nested = Paths.get("backend", folder).toAbsolutePath().normalize();
        if (Files.exists(nested)) return nested;
        try {
            Files.createDirectories(direct);
            return direct;
        } catch (Exception e) {
            return direct;
        }
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path imageDir = resolveDirectory("images");
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + imageDir.toString() + "/");

        Path uploadDir = resolveDirectory("uploads");
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir.toString() + "/");
    }
}
