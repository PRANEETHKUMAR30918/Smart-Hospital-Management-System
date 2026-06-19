package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Patient;
import com.hospital.repository.UserRepository;
import com.hospital.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;
    private final UserRepository userRepository;

    // ── Patient-scoped endpoints ───────────────────────────────────────────────

    @GetMapping("/patient/profile")
    public ResponseEntity<ApiResponse<Patient>> getPatientProfile(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success("Patient profile",
                patientService.getPatientByUserId(userId)));
    }

    @PutMapping("/patient/profile/{id}")
    public ResponseEntity<ApiResponse<Patient>> updatePatientProfile(
            @PathVariable Long id,
            @RequestBody Patient patient) {
        return ResponseEntity.ok(ApiResponse.success("Patient profile updated",
                patientService.updatePatient(id, patient)));
    }

    // ── Admin-scoped endpoints ─────────────────────────────────────────────────

    @GetMapping("/admin/patients")
    public ResponseEntity<ApiResponse<List<Patient>>> getAllPatients() {
        return ResponseEntity.ok(ApiResponse.success("All patients", patientService.getAllPatients()));
    }

    @GetMapping("/admin/patients/{id}")
    public ResponseEntity<ApiResponse<Patient>> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Patient found", patientService.getPatientById(id)));
    }

    @DeleteMapping("/admin/patients/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted", null));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Long getUserId(Authentication auth) {
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username))
                .getId();
    }
}
