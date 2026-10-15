package com.hospital.service;

import com.hospital.dto.JwtResponse;
import com.hospital.dto.RegisterRequest;
import com.hospital.entity.Patient;
import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import com.hospital.security.JwtUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PatientRepository patientRepository;
    @Mock private DoctorRepository doctorRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtils jwtUtils;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserDetailsService userDetailsService;

    @InjectMocks private AuthService authService;

    @Test
    void register_withClientSuppliedAdminRole_enforcesPatientRoleToPreventPrivilegeEscalation() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("malicious_user");
        request.setEmail("attacker@hospital.com");
        request.setPassword("secret123");
        request.setRole(Role.ADMIN); // Malicious attempt to self-register as ADMIN

        when(userRepository.existsByUsername("malicious_user")).thenReturn(false);
        when(userRepository.existsByEmail("attacker@hospital.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_secret");

        Patient patient = Patient.builder().id(50L).build();
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetailsService.loadUserByUsername("malicious_user")).thenReturn(userDetails);
        when(jwtUtils.generateToken(userDetails)).thenReturn("jwt_token_xyz");

        JwtResponse response = authService.register(request);

        // Verify user saved in DB has Role.PATIENT, NOT Role.ADMIN
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getRole()).isEqualTo(Role.PATIENT);

        // Verify patient profile was created, not doctor
        verify(patientRepository).save(any(Patient.class));
        verify(doctorRepository, never()).save(any());

        assertThat(response.getRole()).isEqualTo("PATIENT");
        assertThat(response.getToken()).isEqualTo("jwt_token_xyz");
    }
}
