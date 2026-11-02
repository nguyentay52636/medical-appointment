package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleSummaryDTO {
    private Integer doctorId;
    private Double totalWeeklyHours;
    private Integer activeDaysCount;
    private Double minRequiredHours;
    private Integer minRequiredDays;
    private Boolean isCompliant;
    private List<String> workingDays;
    private List<String> workingDaysVi;
    private String complianceMessage;

    public static DoctorScheduleSummaryDTOBuilder builder() {
        return new DoctorScheduleSummaryDTOBuilder();
    }

    public static class DoctorScheduleSummaryDTOBuilder {
        private Integer doctorId;
        private Double totalWeeklyHours;
        private Integer activeDaysCount;
        private Double minRequiredHours;
        private Integer minRequiredDays;
        private Boolean isCompliant;
        private List<String> workingDays;
        private List<String> workingDaysVi;
        private String complianceMessage;

        public DoctorScheduleSummaryDTOBuilder doctorId(Integer doctorId) {
            this.doctorId = doctorId;
            return this;
        }

        public DoctorScheduleSummaryDTOBuilder totalWeeklyHours(Double totalWeeklyHours) {
            this.totalWeeklyHours = totalWeeklyHours;
            return this;
        }

        public DoctorScheduleSummaryDTOBuilder activeDaysCount(Integer activeDaysCount) {
            this.activeDaysCount = activeDaysCount;
            return this;
        }

        public DoctorScheduleSummaryDTOBuilder minRequiredHours(Double minRequiredHours) {
            this.minRequiredHours = minRequiredHours;
            return this;
        }

        public DoctorScheduleSummaryDTOBuilder minRequiredDays(Integer minRequiredDays) {
            this.minRequiredDays = minRequiredDays;
            return this;
        }

        public DoctorScheduleSummaryDTOBuilder isCompliant(Boolean isCompliant) {
            this.isCompliant = isCompliant;
            return this;
        }

        public DoctorScheduleSummaryDTOBuilder workingDays(List<String> workingDays) {
            this.workingDays = workingDays;
            return this;
        }

        public DoctorScheduleSummaryDTOBuilder workingDaysVi(List<String> workingDaysVi) {
            this.workingDaysVi = workingDaysVi;
            return this;
        }

        public DoctorScheduleSummaryDTOBuilder complianceMessage(String complianceMessage) {
            this.complianceMessage = complianceMessage;
            return this;
        }

        public DoctorScheduleSummaryDTO build() {
            DoctorScheduleSummaryDTO dto = new DoctorScheduleSummaryDTO();
            dto.doctorId = this.doctorId;
            dto.totalWeeklyHours = this.totalWeeklyHours;
            dto.activeDaysCount = this.activeDaysCount;
            dto.minRequiredHours = this.minRequiredHours;
            dto.minRequiredDays = this.minRequiredDays;
            dto.isCompliant = this.isCompliant;
            dto.workingDays = this.workingDays;
            dto.workingDaysVi = this.workingDaysVi;
            dto.complianceMessage = this.complianceMessage;
            return dto;
        }
    }

    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }
    public Double getTotalWeeklyHours() { return totalWeeklyHours; }
    public void setTotalWeeklyHours(Double totalWeeklyHours) { this.totalWeeklyHours = totalWeeklyHours; }
    public Integer getActiveDaysCount() { return activeDaysCount; }
    public void setActiveDaysCount(Integer activeDaysCount) { this.activeDaysCount = activeDaysCount; }
    public Double getMinRequiredHours() { return minRequiredHours; }
    public void setMinRequiredHours(Double minRequiredHours) { this.minRequiredHours = minRequiredHours; }
    public Integer getMinRequiredDays() { return minRequiredDays; }
    public void setMinRequiredDays(Integer minRequiredDays) { this.minRequiredDays = minRequiredDays; }
    public Boolean getIsCompliant() { return isCompliant; }
    public void setIsCompliant(Boolean isCompliant) { this.isCompliant = isCompliant; }
    public List<String> getWorkingDays() { return workingDays; }
    public void setWorkingDays(List<String> workingDays) { this.workingDays = workingDays; }
    public List<String> getWorkingDaysVi() { return workingDaysVi; }
    public void setWorkingDaysVi(List<String> workingDaysVi) { this.workingDaysVi = workingDaysVi; }
    public String getComplianceMessage() { return complianceMessage; }
    public void setComplianceMessage(String complianceMessage) { this.complianceMessage = complianceMessage; }
}
