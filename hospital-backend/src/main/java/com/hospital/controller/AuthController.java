package com.hospital.controller;

import com.hospital.dto.ApiResponse;
import com.hospital.dto.JwtResponse;
import com.hospital.dto.LoginRequest;
import com.hospital.dto.RegisterRequest;
import com.hospital.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.hospital.entity.User;
import com.hospital.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<JwtResponse>> register(@Valid @RequestBody RegisterRequest request) {
        JwtResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(Authentication auth, @RequestBody User updateReq) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (updateReq.getEmail() != null) {
            user.setEmail(updateReq.getEmail());
        }
        
        User savedUser = userRepository.save(user);
        savedUser.setPassword(null); // Don't return password
        return ResponseEntity.ok(ApiResponse.success("Profile updated", savedUser));
    }

    @PutMapping("/profile/photo")
    public ResponseEntity<ApiResponse<User>> updateProfilePhoto(Authentication auth, @RequestBody java.util.Map<String, String> payload) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setProfilePhoto(payload.get("photo"));
        User savedUser = userRepository.save(user);
        savedUser.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success("Profile photo updated", savedUser));
    }
}
