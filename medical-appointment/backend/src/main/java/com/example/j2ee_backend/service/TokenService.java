package com.example.j2ee_backend.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenService {
    // token -> (email, expiry)
    private final Map<String, TokenInfo> tokenStore = new ConcurrentHashMap<>();

    public String createToken(String email) {
        String token = UUID.randomUUID().toString();
        tokenStore.put(token, new TokenInfo(email, LocalDateTime.now().plusMinutes(30)));
        return token;
    }

    public TokenInfo validateToken(String token) {
        TokenInfo info = tokenStore.get(token);
        if (info == null || info.getExpiry().isBefore(LocalDateTime.now())) {
            return null; // token không hợp lệ hoặc hết hạn
        }
        return info;
    }

    public void removeToken(String token) {
        tokenStore.remove(token);
    }

    public static class TokenInfo {
        private String email;
        private LocalDateTime expiry;

        public TokenInfo(String email, LocalDateTime expiry) {
            this.email = email;
            this.expiry = expiry;
        }

        public String getEmail() { return email; }
        public LocalDateTime getExpiry() { return expiry; }
    }
}
