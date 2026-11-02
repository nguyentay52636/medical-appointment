package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
//Đại diện cho một lát cắt trên biểu đồ (Số lượng và tỷ lệ của một trạng thái).
@Data
public class StatisticItem {
    private String statusName;
    private long count;
    private double percentage;

    public StatisticItem() {
    }

    public StatisticItem(String statusName, long count, double percentage) {
        this.statusName = statusName;
        this.count = count;
        this.percentage = percentage;
    }

    public String getStatusName() {
        return statusName;
    }

    public void setStatusName(String statusName) {
        this.statusName = statusName;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}