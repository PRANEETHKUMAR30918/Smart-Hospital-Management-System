package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.BillingDTO;
import com.hospital.entity.Billing;
import com.hospital.repository.UserRepository;
import com.hospital.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BillingController {

    private final BillingService billingService;
    private final UserRepository userRepository;

    // ── Patient-scoped endpoints ───────────────────────────────────────────────

    @GetMapping("/patient/billing")
    public ResponseEntity<ApiResponse<List<Billing>>> getPatientBilling(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(ApiResponse.success("Patient billing",
                billingService.getBillingByPatientUserId(userId)));
    }

    @PostMapping("/patient/billing/{billingId}/pay")
    public ResponseEntity<ApiResponse<Billing>> payBill(
            @PathVariable Long billingId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        Long userId = getUserId(auth);
        String paymentMethod = body.getOrDefault("paymentMethod", "CASH");
        return ResponseEntity.ok(ApiResponse.success("Payment processed",
                billingService.processPayment(billingId, paymentMethod, userId)));
    }

    // ── Admin-scoped endpoints ─────────────────────────────────────────────────

    @GetMapping("/admin/billing")
    public ResponseEntity<ApiResponse<List<Billing>>> getAllBilling() {
        return ResponseEntity.ok(ApiResponse.success("All billing records", billingService.getAllBilling()));
    }

    @PostMapping("/admin/billing")
    public ResponseEntity<ApiResponse<Billing>> createBilling(@RequestBody BillingDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Billing created", billingService.createBilling(dto)));
    }

    @GetMapping("/admin/billing/{id}")
    public ResponseEntity<ApiResponse<Billing>> getBillingById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Billing found", billingService.getBillingById(id)));
    }

    @GetMapping("/admin/billing/revenue")
    public ResponseEntity<ApiResponse<Double>> getTotalRevenue() {
        return ResponseEntity.ok(ApiResponse.success("Total revenue", billingService.getTotalRevenue()));
    }

    @PostMapping("/admin/billing/{billingId}/pay")
    public ResponseEntity<ApiResponse<Billing>> processPaymentAdmin(
            @PathVariable Long billingId,
            @RequestBody Map<String, String> body) {
        String paymentMethod = body.getOrDefault("paymentMethod", "CASH");
        return ResponseEntity.ok(ApiResponse.success("Payment processed",
                billingService.processPayment(billingId, paymentMethod)));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Long getUserId(Authentication auth) {
        String username = auth.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username))
                .getId();
    }
}
