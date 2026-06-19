package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "medical_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    private String diagnosis;
    private String treatment;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDate date;
}
