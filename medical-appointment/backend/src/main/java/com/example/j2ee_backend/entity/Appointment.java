package com.example.j2ee_backend.entity;

import jakarta.persistence.*;
import java.sql.Timestamp;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "appointment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "appointment_code", nullable = false, unique = true, length = 50)
    private String appointmentCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bookable_slot_id", nullable = false)
    private BookableSlot bookableSlot;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "reason_for_visit", length = 500)
    private String reasonForVisit;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "price")
    private Integer price = 0;

    @Column(name = "payment_method")
    private String paymentMethod = "offline";

    @Column(name = "payment_status")
    private String paymentStatus = "pending";

    @Column(name = "vnp_txn_ref")
    private String vnpTxnRef;

    @Column(name = "updated_at")
    private Timestamp updateAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = new Timestamp(System.currentTimeMillis());
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getAppointmentCode() { return appointmentCode; }
    public void setAppointmentCode(String appointmentCode) { this.appointmentCode = appointmentCode; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public BookableSlot getBookableSlot() { return bookableSlot; }
    public void setBookableSlot(BookableSlot bookableSlot) { this.bookableSlot = bookableSlot; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReasonForVisit() { return reasonForVisit; }
    public void setReasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getVnpTxnRef() { return vnpTxnRef; }
    public void setVnpTxnRef(String vnpTxnRef) { this.vnpTxnRef = vnpTxnRef; }

    public Timestamp getUpdateAt() { return updateAt; }
    public void setUpdateAt(Timestamp updateAt) { this.updateAt = updateAt; }
}