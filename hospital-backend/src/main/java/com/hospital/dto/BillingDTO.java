package com.hospital.dto;

import lombok.Data;

@Data
public class BillingDTO {
    private Long patientId;
    private Long appointmentId;
    private Double amount;
    private String description;
    private String paymentMethod;
}
