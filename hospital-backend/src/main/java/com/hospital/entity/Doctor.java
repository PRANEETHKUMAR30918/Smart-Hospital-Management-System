package com.hospital.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String specialization;

    private String phone;

    @Column(name = "available_days")
    private String availableDays;

    @Column(name = "consultation_fee")
    private Double consultationFee;

    private String qualification;
    private String experience;

    @Column(name = "is_available")
    private Boolean isAvailable = true;
}
