package com.hospital.service;

import com.hospital.dto.PrescriptionDTO;
import com.hospital.entity.*;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public Prescription createPrescription(PrescriptionDTO dto, Long doctorUserId) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", dto.getAppointmentId()));
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));

        Prescription prescription = Prescription.builder()
                .appointment(appointment)
                .patient(patient)
                .doctor(doctor)
                .diagnosis(dto.getDiagnosis())
                .medicines(dto.getMedicines())
                .instructions(dto.getInstructions())
                .followUpDate(dto.getFollowUpDate())
                .build();
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    public Prescription updatePrescription(Long id, PrescriptionDTO dto, Long doctorUserId) {
        Prescription existing = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", id));
        
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
                
        if (!existing.getDoctor().getId().equals(doctor.getId())) {
             throw new RuntimeException("Not authorized to edit this prescription");
        }

        existing.setDiagnosis(dto.getDiagnosis());
        existing.setMedicines(dto.getMedicines());
        existing.setInstructions(dto.getInstructions());
        existing.setFollowUpDate(dto.getFollowUpDate());
        return prescriptionRepository.save(existing);
    }

    public List<Prescription> getPrescriptionsByPatientUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        return prescriptionRepository.findByPatientId(patient.getId());
    }

    public List<Prescription> getPrescriptionsByDoctorUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return prescriptionRepository.findByDoctorId(doctor.getId());
    }

    public Prescription getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", id));
    }

    public Prescription getPrescriptionByAppointmentId(Long appointmentId) {
        return prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription for appointment " + appointmentId));
    }

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }
}
