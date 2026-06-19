package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.repository.UserRepository;
import com.hospital.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    @GetMapping("/admin/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard stats",
                dashboardService.getAdminDashboard()));
    }

    @GetMapping("/doctor/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDoctorDashboard(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success("Doctor dashboard stats",
                dashboardService.getDoctorDashboard(userId)));
    }

    @GetMapping("/patient/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPatientDashboard(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success("Patient dashboard stats",
                dashboardService.getPatientDashboard(userId)));
    }

    private Long getUserId(Authentication auth) {
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username))
                .getId();
    }
}
