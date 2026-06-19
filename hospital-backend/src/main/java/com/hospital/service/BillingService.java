package com.hospital.service;

import com.hospital.dto.BillingDTO;
import com.hospital.entity.*;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillingRepository billingRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    public List<Billing> getAllBilling() {
        return billingRepository.findAll();
    }

    public List<Billing> getBillingByPatientUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return billingRepository.findByPatientId(patient.getId());
    }

    public List<Billing> getBillingByPatientId(Long patientId) {
        return billingRepository.findByPatientId(patientId);
    }

    @Transactional
    public Billing createBilling(BillingDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", dto.getAppointmentId()));

        Billing billing = Billing.builder()
                .patient(patient)
                .appointment(appointment)
                .amount(dto.getAmount())
                .status(PaymentStatus.PENDING)
                .description(dto.getDescription())
                .paymentMethod(dto.getPaymentMethod())
                .build();
        return billingRepository.save(billing);
    }

    @Transactional
    public Billing processPayment(Long billingId, String paymentMethod) {
        Billing billing = billingRepository.findById(billingId)
                .orElseThrow(() -> new ResourceNotFoundException("Billing", billingId));
        billing.setStatus(PaymentStatus.PAID);
        billing.setPaymentMethod(paymentMethod);
        billing.setPaymentDate(LocalDateTime.now());
        return billingRepository.save(billing);
    }

    public Billing getBillingById(Long id) {
        return billingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Billing", id));
    }

    public Double getTotalRevenue() {
        Double revenue = billingRepository.getTotalRevenue();
        return revenue != null ? revenue : 0.0;
    }
}
