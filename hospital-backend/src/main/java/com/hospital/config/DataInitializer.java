package com.hospital.config;

import com.hospital.entity.Role;
import com.hospital.entity.User;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.repository.UserRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create default admin account if it doesn't exist
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@hospital.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Default admin account created: username=admin, password=admin123");
        } else {
            log.info("Admin account already exists, skipping creation.");
        }

        // Doctor user
        if (!userRepository.existsByUsername("dr.smith")) {
            User doctorUser = User.builder()
                    .username("dr.smith")
                    .password(passwordEncoder.encode("doctor123"))
                    .email("drsmith@medicore.com")
                    .role(Role.DOCTOR)
                    .build();
            userRepository.save(doctorUser);

            Doctor doctor = Doctor.builder()
                    .user(doctorUser)
                    .name("Dr. Smith")
                    .specialization("Cardiologist")
                    .phone("1234567890")
                    .availableDays("Mon, Wed, Fri")
                    .consultationFee(150.0)
                    .isAvailable(true)
                    .build();
            doctorRepository.save(doctor);
            log.info("Default doctor account created: username=dr.smith, password=doctor123");
        }

        // Patient user
        if (!userRepository.existsByUsername("john.doe")) {
            User patientUser = User.builder()
                    .username("john.doe")
                    .password(passwordEncoder.encode("patient123"))
                    .email("john.doe@medicore.com")
                    .role(Role.PATIENT)
                    .build();
            userRepository.save(patientUser);

            Patient patient = Patient.builder()
                    .user(patientUser)
                    .name("John Doe")
                    .dob(LocalDate.of(1990, 5, 15))
                    .gender("Male")
                    .bloodGroup("O+")
                    .phone("0987654321")
                    .address("123 Main St, City")
                    .build();
            patientRepository.save(patient);
            log.info("Default patient account created: username=john.doe, password=patient123");
        }
    }
}

