package com.hospital.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AppointmentDTO {
    private Long doctorId;
    private LocalDate appointmentDate;
    private String timeSlot;
    private String symptoms;
    private String notes;
}
