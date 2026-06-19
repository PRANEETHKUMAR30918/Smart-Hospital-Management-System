package com.hospital.service;

import com.hospital.entity.Patient;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", id));
    }

    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
    }

    public Patient updatePatient(Long id, Patient updated) {
        Patient patient = getPatientById(id);
        patient.setName(updated.getName());
        patient.setPhone(updated.getPhone());
        patient.setAddress(updated.getAddress());
        patient.setBloodGroup(updated.getBloodGroup());
        patient.setGender(updated.getGender());
        patient.setDob(updated.getDob());
        patient.setEmergencyContact(updated.getEmergencyContact());
        return patientRepository.save(patient);
    }

    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient", id);
        }
        patientRepository.deleteById(id);
    }
}
