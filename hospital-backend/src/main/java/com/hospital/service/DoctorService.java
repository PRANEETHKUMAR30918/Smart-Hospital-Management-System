package com.hospital.service;

import com.hospital.entity.Doctor;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public List<Doctor> getAvailableDoctors() {
        return doctorRepository.findByIsAvailable(true);
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", id));
    }

    public Doctor getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + userId));
    }

    public Doctor updateDoctor(Long id, Doctor updated) {
        Doctor doctor = getDoctorById(id);
        doctor.setName(updated.getName());
        doctor.setSpecialization(updated.getSpecialization());
        doctor.setPhone(updated.getPhone());
        doctor.setAvailableDays(updated.getAvailableDays());
        doctor.setConsultationFee(updated.getConsultationFee());
        doctor.setQualification(updated.getQualification());
        doctor.setExperience(updated.getExperience());
        doctor.setIsAvailable(updated.getIsAvailable());
        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Doctor", id);
        }
        doctorRepository.deleteById(id);
    }

    public List<Doctor> getDoctorsBySpecialization(String specialization) {
        return doctorRepository.findBySpecialization(specialization);
    }
}
