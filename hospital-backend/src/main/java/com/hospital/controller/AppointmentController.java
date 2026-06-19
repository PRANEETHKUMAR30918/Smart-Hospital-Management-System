package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.AppointmentDTO;
import com.hospital.dto.StatusUpdateDTO;
import com.hospital.entity.Appointment;
import com.hospital.repository.UserRepository;
import com.hospital.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;

    // ── Patient-scoped endpoints ───────────────────────────────────────────────

    @PostMapping("/patient/appointments")
    public ResponseEntity<ApiResponse<Appointment>> bookAppointment(
            @RequestBody AppointmentDTO dto,
            Authentication auth) {
        Long userId = getUserId(auth);
        Appointment appointment = appointmentService.bookAppointment(dto, userId);
        return ResponseEntity.ok(ApiResponse.success("Appointment booked successfully", appointment));
    }

    @GetMapping("/patient/appointments")
    public ResponseEntity<ApiResponse<List<Appointment>>> getPatientAppointments(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success("Patient appointments",
                appointmentService.getAppointmentsByPatientUserId(userId)));
    }

    @GetMapping("/patient/appointments/{id}")
    public ResponseEntity<ApiResponse<Appointment>> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Appointment found",
                appointmentService.getAppointmentById(id)));
    }

    @PutMapping("/patient/appointments/{id}/status")
    public ResponseEntity<ApiResponse<Appointment>> patientUpdateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Appointment status updated",
                appointmentService.updateStatus(id, dto)));
    }

    @PutMapping("/patient/appointments/{id}")
    public ResponseEntity<ApiResponse<Appointment>> patientUpdateAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Appointment updated",
                appointmentService.updateAppointment(id, dto)));
    }

    @DeleteMapping("/patient/appointments/{id}")
    public ResponseEntity<ApiResponse<Void>> patientDeleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment canceled", null));
    }

    // ── Doctor-scoped endpoints ────────────────────────────────────────────────

    @GetMapping("/doctor/appointments")
    public ResponseEntity<ApiResponse<List<Appointment>>> getDoctorAppointments(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success("Doctor appointments",
                appointmentService.getAppointmentsByDoctorUserId(userId)));
    }

    @PutMapping("/doctor/appointments/{id}/status")
    public ResponseEntity<ApiResponse<Appointment>> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Appointment status updated",
                appointmentService.updateStatus(id, dto)));
    }

    @PutMapping("/doctor/appointments/{id}")
    public ResponseEntity<ApiResponse<Appointment>> doctorUpdateAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Appointment updated",
                appointmentService.updateAppointment(id, dto)));
    }

    @DeleteMapping("/doctor/appointments/{id}")
    public ResponseEntity<ApiResponse<Void>> doctorDeleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment canceled", null));
    }

    // ── Admin-scoped endpoints ─────────────────────────────────────────────────

    @GetMapping("/admin/appointments")
    public ResponseEntity<ApiResponse<List<Appointment>>> getAllAppointments() {
        return ResponseEntity.ok(ApiResponse.success("All appointments",
                appointmentService.getAllAppointments()));
    }

    @PutMapping("/admin/appointments/{id}/status")
    public ResponseEntity<ApiResponse<Appointment>> adminUpdateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Appointment status updated",
                appointmentService.updateStatus(id, dto)));
    }

    @PutMapping("/admin/appointments/{id}")
    public ResponseEntity<ApiResponse<Appointment>> adminUpdateAppointment(
            @PathVariable Long id,
            @RequestBody AppointmentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Appointment updated",
                appointmentService.updateAppointment(id, dto)));
    }

    @DeleteMapping("/admin/appointments/{id}")
    public ResponseEntity<ApiResponse<Void>> adminDeleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted", null));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Long getUserId(Authentication auth) {
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username))
                .getId();
    }
}
