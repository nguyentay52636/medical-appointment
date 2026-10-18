package com.example.j2ee_backend.config;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.pinecone.PineconeVectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Value("${pinecone.api-key}")
    private String apiKey;

    @Value("${pinecone.index-name}")
    private String indexName;

    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        return PineconeVectorStore.builder(embeddingModel)
                .apiKey(apiKey)
                .indexName(indexName)
                .build();
    }
}
