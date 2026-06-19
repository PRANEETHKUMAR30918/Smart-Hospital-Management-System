package com.hospital.service;

import com.hospital.entity.*;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillingRepository billingRepository;

    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPatients", patientRepository.count());
        stats.put("totalDoctors", doctorRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("pendingAppointments", appointmentRepository.countByStatus(AppointmentStatus.PENDING));
        stats.put("confirmedAppointments", appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED));
        stats.put("completedAppointments", appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        stats.put("cancelledAppointments", appointmentRepository.countByStatus(AppointmentStatus.CANCELLED));
        Double revenue = billingRepository.getTotalRevenue();
        stats.put("totalRevenue", revenue != null ? revenue : 0.0);
        stats.put("todayAppointments", appointmentRepository.countByDate(LocalDate.now()));
        return stats;
    }

    public Map<String, Object> getDoctorDashboard(Long doctorUserId) {
        Doctor doctor = doctorRepository.findByUserId(doctorUserId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        Map<String, Object> stats = new HashMap<>();
        long total = appointmentRepository.findByDoctorId(doctor.getId()).size();
        long todayCount = appointmentRepository.findByDoctorIdAndAppointmentDate(
                doctor.getId(), LocalDate.now()).size();
        stats.put("totalAppointments", total);
        stats.put("todayAppointments", todayCount);
        stats.put("doctorId", doctor.getId());
        stats.put("doctorName", doctor.getName());
        stats.put("specialization", doctor.getSpecialization());
        return stats;
    }

    public Map<String, Object> getPatientDashboard(Long patientUserId) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Map<String, Object> stats = new HashMap<>();
        long total = appointmentRepository.findByPatientId(patient.getId()).size();
        stats.put("totalAppointments", total);
        stats.put("patientId", patient.getId());
        stats.put("patientName", patient.getName());
        Double totalBilling = billingRepository.getTotalByPatient(patient.getId());
        stats.put("totalBilling", totalBilling != null ? totalBilling : 0.0);
        return stats;
    }
}
