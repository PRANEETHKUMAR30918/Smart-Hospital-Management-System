package com.hospital.service;

import com.hospital.dto.JwtResponse;
import com.hospital.dto.LoginRequest;
import com.hospital.dto.RegisterRequest;
import com.hospital.entity.*;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.*;
import com.hospital.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public JwtResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Security: Prevent privilege escalation. Public self-registration always assigns PATIENT.
        Role role = Role.PATIENT;

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();
        userRepository.save(user);

        Long profileId = null;
        if (role == Role.PATIENT) {
            Patient patient = Patient.builder()
                    .user(user)
                    .name(request.getName() != null ? request.getName() : request.getUsername())
                    .phone(request.getPhone())
                    .gender(request.getGender())
                    .bloodGroup(request.getBloodGroup())
                    .address(request.getAddress())
                    .dob(request.getDob() != null ? LocalDate.parse(request.getDob()) : null)
                    .build();
            Patient saved = patientRepository.save(patient);
            profileId = saved.getId();
        } else if (role == Role.DOCTOR) {
            Doctor doctor = Doctor.builder()
                    .user(user)
                    .name(request.getName() != null ? request.getName() : request.getUsername())
                    .specialization(request.getSpecialization() != null ? request.getSpecialization() : "General")
                    .phone(request.getPhone())
                    .consultationFee(request.getConsultationFee() != null ? request.getConsultationFee() : 500.0)
                    .qualification(request.getQualification())
                    .experience(request.getExperience())
                    .availableDays(request.getAvailableDays() != null ? request.getAvailableDays() : "Mon,Tue,Wed,Thu,Fri")
                    .isAvailable(true)
                    .build();
            Doctor saved = doctorRepository.save(doctor);
            profileId = saved.getId();
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtils.generateToken(userDetails);

        return JwtResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profileId(profileId)
                .profilePhoto(user.getProfilePhoto())
                .build();
    }

    public JwtResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtils.generateToken(userDetails);

        Long profileId = null;
        if (user.getRole() == Role.PATIENT) {
            profileId = patientRepository.findByUserId(user.getId()).map(Patient::getId).orElse(null);
        } else if (user.getRole() == Role.DOCTOR) {
            profileId = doctorRepository.findByUserId(user.getId()).map(Doctor::getId).orElse(null);
        }

        return JwtResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profileId(profileId)
                .profilePhoto(user.getProfilePhoto())
                .build();
    }
}
