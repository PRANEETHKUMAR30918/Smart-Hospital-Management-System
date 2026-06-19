package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.MedicalHistory;
import com.hospital.entity.Patient;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.service.MedicalHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MedicalHistoryController {

    private final MedicalHistoryService medicalHistoryService;
    private final UserRepository userRepository;
    private final PatientRepository patientRepository;

    // ── Patient-scoped endpoints ───────────────────────────────────────────────

    @GetMapping("/patient/medical-history")
    public ResponseEntity<ApiResponse<List<MedicalHistory>>> getPatientHistory(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success("Medical history",
                medicalHistoryService.getByPatientUserId(userId)));
    }

    // ── Doctor-scoped endpoints ────────────────────────────────────────────────

    @PostMapping("/doctor/medical-history")
    public ResponseEntity<ApiResponse<MedicalHistory>> addHistory(
            @RequestBody MedicalHistory history,
            Authentication auth) {
        Long userId = getUserId(auth);
        MedicalHistory saved = medicalHistoryService.addMedicalHistory(history, userId);
        return ResponseEntity.ok(ApiResponse.success("Medical history added", saved));
    }

    @GetMapping("/doctor/medical-history/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<MedicalHistory>>> getPatientHistoryByDoctor(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success("Patient medical history",
                medicalHistoryService.getByPatientId(patientId)));
    }

    // ── Admin-scoped endpoints ─────────────────────────────────────────────────

    @GetMapping("/admin/medical-history/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<MedicalHistory>>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(ApiResponse.success("Patient medical history",
                medicalHistoryService.getByPatientId(patientId)));
    }

    @DeleteMapping("/admin/medical-history/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        medicalHistoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Medical history deleted", null));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Long getUserId(Authentication auth) {
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username))
                .getId();
    }
}
