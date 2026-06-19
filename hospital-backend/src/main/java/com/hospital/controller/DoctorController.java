package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.entity.Doctor;
import com.hospital.repository.UserRepository;
import com.hospital.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorController {

    private final DoctorService doctorService;
    private final UserRepository userRepository;

    /**
     * Authenticated users can fetch available doctors (for booking).
     */
    @GetMapping("/doctors/available")
    public ResponseEntity<ApiResponse<List<Doctor>>> getAvailableDoctors() {
        return ResponseEntity.ok(ApiResponse.success("Available doctors", doctorService.getAvailableDoctors()));
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<ApiResponse<Doctor>> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Doctor found", doctorService.getDoctorById(id)));
    }

    @GetMapping("/doctors/specialization/{spec}")
    public ResponseEntity<ApiResponse<List<Doctor>>> getBySpecialization(@PathVariable String spec) {
        return ResponseEntity.ok(ApiResponse.success("Doctors by specialization",
                doctorService.getDoctorsBySpecialization(spec)));
    }

    // ── Doctor-scoped endpoints ────────────────────────────────────────────────

    @GetMapping("/doctor/profile")
    public ResponseEntity<ApiResponse<Doctor>> getDoctorProfile(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success("Doctor profile",
                doctorService.getDoctorByUserId(userId)));
    }

    @PutMapping("/doctor/profile/{id}")
    public ResponseEntity<ApiResponse<Doctor>> updateDoctorProfile(
            @PathVariable Long id,
            @RequestBody Doctor doctor) {
        return ResponseEntity.ok(ApiResponse.success("Doctor profile updated",
                doctorService.updateDoctor(id, doctor)));
    }

    // ── Admin-scoped endpoints ─────────────────────────────────────────────────

    @GetMapping("/admin/doctors")
    public ResponseEntity<ApiResponse<List<Doctor>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success("All doctors", doctorService.getAllDoctors()));
    }

    @DeleteMapping("/admin/doctors/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted", null));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Long getUserId(Authentication auth) {
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username))
                .getId();
    }
}
