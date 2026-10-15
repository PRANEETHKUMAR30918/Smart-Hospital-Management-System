package com.hospital.service;

import com.hospital.dto.AppointmentDTO;
import com.hospital.dto.StatusUpdateDTO;
import com.hospital.entity.*;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final BillingRepository billingRepository;

    @Transactional
    public Appointment bookAppointment(AppointmentDTO dto, Long patientUserId) {
        Patient patient = patientRepository.findByUserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", dto.getDoctorId()));

        if (dto.getAppointmentDate() != null && dto.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Appointment date cannot be in the past");
        }

        boolean slotConflict = appointmentRepository.existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(
                doctor.getId(), dto.getAppointmentDate(), dto.getTimeSlot(), AppointmentStatus.CANCELLED);
        if (slotConflict) {
            throw new IllegalStateException("The selected time slot is already booked for this doctor");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(dto.getAppointmentDate())
                .timeSlot(dto.getTimeSlot())
                .symptoms(dto.getSymptoms())
                .notes(dto.getNotes())
                .status(AppointmentStatus.PENDING)
                .build();
        Appointment saved = appointmentRepository.save(appointment);

        // Auto-create billing record
        Billing billing = Billing.builder()
                .patient(patient)
                .appointment(saved)
                .amount(doctor.getConsultationFee() != null ? doctor.getConsultationFee() : 0.0)
                .status(PaymentStatus.PENDING)
                .description("Consultation fee for appointment #" + saved.getId())
                .build();
        billingRepository.save(billing);

        return saved;
    }

    public List<Appointment> getAppointmentsByPatientUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
        return appointmentRepository.findByPatientId(patient.getId());
    }

    public List<Appointment> getAppointmentsByDoctorUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return appointmentRepository.findByDoctorId(doctor.getId());
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Transactional
    public Appointment updateStatus(Long appointmentId, StatusUpdateDTO dto) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));
        appointment.setStatus(AppointmentStatus.valueOf(dto.getStatus()));
        if (dto.getNotes() != null) {
            appointment.setNotes(dto.getNotes());
        }
        return appointmentRepository.save(appointment);
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
    }

    public Appointment getPatientAppointmentById(Long id, Long patientUserId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        validatePatientOwnership(appointment, patientUserId);
        return appointment;
    }

    public Appointment getAppointmentByIdAndPatientUserId(Long id, Long patientUserId) {
        return getPatientAppointmentById(id, patientUserId);
    }

    @Transactional
    public Appointment updateStatusByPatient(Long appointmentId, StatusUpdateDTO dto, Long patientUserId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));
        validatePatientOwnership(appointment, patientUserId);
        appointment.setStatus(AppointmentStatus.valueOf(dto.getStatus()));
        if (dto.getNotes() != null) {
            appointment.setNotes(dto.getNotes());
        }
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment updateAppointmentByPatient(Long id, AppointmentDTO dto, Long patientUserId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        validatePatientOwnership(appointment, patientUserId);

        if (dto.getAppointmentDate() != null) {
            appointment.setAppointmentDate(dto.getAppointmentDate());
        }
        if (dto.getTimeSlot() != null) {
            appointment.setTimeSlot(dto.getTimeSlot());
        }
        if (dto.getSymptoms() != null) {
            appointment.setSymptoms(dto.getSymptoms());
        }
        if (dto.getNotes() != null) {
            appointment.setNotes(dto.getNotes());
        }
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public void deleteAppointmentByPatient(Long id, Long patientUserId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        validatePatientOwnership(appointment, patientUserId);
        appointmentRepository.delete(appointment);
    }

    @Transactional
    public Appointment updateAppointment(Long id, AppointmentDTO dto) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        
        if (dto.getAppointmentDate() != null) {
            appointment.setAppointmentDate(dto.getAppointmentDate());
        }
        if (dto.getTimeSlot() != null) {
            appointment.setTimeSlot(dto.getTimeSlot());
        }
        if (dto.getSymptoms() != null) {
            appointment.setSymptoms(dto.getSymptoms());
        }
        if (dto.getNotes() != null) {
            appointment.setNotes(dto.getNotes());
        }
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment", id);
        }
        appointmentRepository.deleteById(id);
    }

    private void validatePatientOwnership(Appointment appointment, Long patientUserId) {
        if (appointment.getPatient() == null || appointment.getPatient().getUser() == null
                || !appointment.getPatient().getUser().getId().equals(patientUserId)) {
            throw new AccessDeniedException("You are not authorized to access or modify this appointment");
        }
    }
}
