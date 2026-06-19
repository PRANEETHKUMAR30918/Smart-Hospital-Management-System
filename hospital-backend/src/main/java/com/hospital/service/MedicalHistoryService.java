package com.hospital.service;

import com.hospital.entity.*;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalHistoryService {

    private final MedicalHistoryRepository medicalHistoryRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public List<MedicalHistory> getByPatientId(Long patientId) {
        return medicalHistoryRepository.findByPatientId(patientId);
    }

    public List<MedicalHistory> getByPatientUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        return medicalHistoryRepository.findByPatientId(patient.getId());
    }

    public List<MedicalHistory> getByDoctorId(Long doctorId) {
        return medicalHistoryRepository.findByDoctorId(doctorId);
    }

    @Transactional
    public MedicalHistory addMedicalHistory(MedicalHistory history, Long doctorUserId) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        history.setDoctor(doctor);
        return medicalHistoryRepository.save(history);
    }

    @Transactional
    public MedicalHistory save(MedicalHistory history) {
        return medicalHistoryRepository.save(history);
    }

    public MedicalHistory getById(Long id) {
        return medicalHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medical History", id));
    }

    public void delete(Long id) {
        if (!medicalHistoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Medical History", id);
        }
        medicalHistoryRepository.deleteById(id);
    }
}
