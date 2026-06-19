package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.PrescriptionDTO;
import com.hospital.entity.Prescription;
import com.hospital.repository.UserRepository;
import com.hospital.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final UserRepository userRepository;

    // ── Doctor-scoped endpoints ────────────────────────────────────────────────

    @PostMapping("/doctor/prescriptions")
    public ResponseEntity<ApiResponse<Prescription>> createPrescription(
            @RequestBody PrescriptionDTO dto,
            Authentication auth) {
        Long userId = getUserId(auth);
        Prescription prescription = prescriptionService.createPrescription(dto, userId);
        return ResponseEntity.ok(ApiResponse.success("Prescription created", prescription));
    }

    @PutMapping("/doctor/prescriptions/{id}")
    public ResponseEntity<ApiResponse<Prescription>> updatePrescription(
            @PathVariable Long id,
            @RequestBody PrescriptionDTO dto,
            Authentication auth) {
        Long userId = getUserId(auth);
        Prescription prescription = prescriptionService.updatePrescription(id, dto, userId);
        return ResponseEntity.ok(ApiResponse.success("Prescription updated", prescription));
    }

    @GetMapping("/doctor/prescriptions")
    public ResponseEntity<ApiResponse<List<Prescription>>> getDoctorPrescriptions(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success("Doctor prescriptions",
                prescriptionService.getPrescriptionsByDoctorUserId(userId)));
    }

    // ── Patient-scoped endpoints ───────────────────────────────────────────────

    @GetMapping("/patient/prescriptions")
    public ResponseEntity<ApiResponse<List<Prescription>>> getPatientPrescriptions(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success("Patient prescriptions",
                prescriptionService.getPrescriptionsByPatientUserId(userId)));
    }

    @GetMapping("/patient/prescriptions/{id}")
    public ResponseEntity<ApiResponse<Prescription>> getPrescriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Prescription found",
                prescriptionService.getPrescriptionById(id)));
    }

    @GetMapping("/patient/prescriptions/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<Prescription>> getPrescriptionByAppointment(
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.success("Prescription for appointment",
                prescriptionService.getPrescriptionByAppointmentId(appointmentId)));
    }

    // ── Admin-scoped endpoints ─────────────────────────────────────────────────

    @GetMapping("/admin/prescriptions")
    public ResponseEntity<ApiResponse<List<Prescription>>> getAllPrescriptions() {
        return ResponseEntity.ok(ApiResponse.success("All prescriptions",
                prescriptionService.getAllPrescriptions()));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Long getUserId(Authentication auth) {
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username))
                .getId();
    }
}
