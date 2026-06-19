package com.hospital.dto;

import lombok.Data;

@Data
public class PrescriptionDTO {
    private Long appointmentId;
    private Long patientId;
    private String diagnosis;
    private String medicines;
    private String instructions;
    private String followUpDate;
}
