package com.hospital.dto;

import com.hospital.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String username;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    private Role role;
    private String name;
    private String phone;
    private String gender;
    private String dob;
    private String bloodGroup;
    private String address;

    // Doctor-specific fields
    private String specialization;
    private Double consultationFee;
    private String qualification;
    private String experience;
    private String availableDays;
}
