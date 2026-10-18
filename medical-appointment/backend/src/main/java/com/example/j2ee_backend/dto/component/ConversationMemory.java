package com.example.j2ee_backend.dto.component;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ConversationMemory {

    private final Map<String, Deque<String>> memory = new ConcurrentHashMap<>();
    private final int maxEntries = 10;

    public void addUserMessage(String sessionId, String text) {
        addMessage(sessionId, "User", text);
    }

    public void addAssistantMessage(String sessionId, String text) {
        addMessage(sessionId, "Assistant", text);
    }

    private void addMessage(String sessionId, String role, String text) {
        String key = sessionId == null ? "default" : sessionId;
        Deque<String> dq = memory.computeIfAbsent(key, k -> new ArrayDeque<>());
        dq.addLast(role + ": " + text);
        while (dq.size() > maxEntries) {
            dq.removeFirst();
        }
    }

    public List<String> getConversation(String sessionId) {
        Deque<String> dq = memory.get(sessionId == null ? "default" : sessionId);
        if (dq == null) return Collections.emptyList();
        return new ArrayList<>(dq);
    }

    public void clear(String sessionId) {
        memory.remove(sessionId == null ? "default" : sessionId);
    }
}
