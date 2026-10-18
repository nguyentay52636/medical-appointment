package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
//Đại diện cho một lát cắt trên biểu đồ (Số lượng và tỷ lệ của một trạng thái).
@Data
@AllArgsConstructor
public class StatisticItem {
    private String statusName;
    private long count;
    private double percentage;
}