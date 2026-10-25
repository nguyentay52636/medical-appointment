package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.DoctorDTO;
import jakarta.annotation.PostConstruct;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RagDataIngestionService {

    private final VectorStore vectorStore;
    private final DoctorService doctorService;

    public RagDataIngestionService(VectorStore vectorStore, DoctorService doctorService) {
        this.vectorStore = vectorStore;
        this.doctorService = doctorService;
    }


    @PostConstruct
    public void initVectorStore() {
        // Tạm dừng việc nạp dữ liệu vào Vector Store khi chưa cấu hình Pinecone hợp lệ
        if (true) return;

        List<DoctorDTO> doctorList = doctorService.getRagDataDoctor();
        List<Document> documents = doctorList.stream()
                .filter(doctor -> {
                    // Check if document with this doctor id already exists
                    List<Document> existing = vectorStore.similaritySearch(SearchRequest.builder()
                            .query("dummy") // dummy query, filter will handle
                            .topK(1)
                            .filterExpression("id == " + doctor.getId())
                            .build());
                    return existing.isEmpty(); // add only if not exists
                })
                .map(doctor -> {
                    String content = "Tên bác sĩ: " + doctor.getFullName() +
                            ", Chuyên ngành: " + doctor.getSpecialtyName() +
                            ", Mô tả thêm: " + doctor.getBio() +
                            ", Số điện thoại: " + doctor.getPhoneNumber() +
                            ", Địa chỉ khám bệnh: " + doctor.getAddress();

                    Map<String, Object> metadata = Map.of(
                            "id", doctor.getId(),
                            "tên bác sĩ", doctor.getFullName(),
                            "chuyên môn", doctor.getSpecialtyName(),
                            "bio", doctor.getBio(),
                            "địa chỉ", doctor.getAddress(),
                            "type", "bác sĩ"
                    );

                    return new Document(content, metadata);
                })
                .collect(Collectors.toList());

        // Code này để tạm dừng việc nạp dữ liệu vào Vector Store
        if (true) return;
        

        if (!documents.isEmpty()) {
            vectorStore.add(documents);
            System.out.println("Loaded " + documents.size() + " items into Vector Store.");
        }
    }
}
