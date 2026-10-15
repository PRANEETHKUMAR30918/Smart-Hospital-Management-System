package com.hospital.service;

import com.hospital.dto.AppointmentDTO;
import com.hospital.dto.StatusUpdateDTO;
import com.hospital.entity.Appointment;
import com.hospital.entity.AppointmentStatus;
import com.hospital.entity.Billing;
import com.hospital.entity.Doctor;
import com.hospital.entity.Patient;
import com.hospital.entity.PaymentStatus;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.BillingRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private PatientRepository patientRepository;
    @Mock private DoctorRepository doctorRepository;
    @Mock private BillingRepository billingRepository;

    @InjectMocks private AppointmentService appointmentService;

    private Patient patient;
    private Doctor doctor;

    @BeforeEach
    void setUp() {
        patient = Patient.builder().id(1L).name("John Doe").build();
        doctor = Doctor.builder().id(5L).name("Dr. Smith").specialization("Cardiologist")
                .consultationFee(150.0).build();
    }

    private AppointmentDTO bookingRequest() {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setDoctorId(5L);
        dto.setAppointmentDate(LocalDate.of(2026, 11, 3));
        dto.setTimeSlot("10:00-10:30");
        dto.setSymptoms("Chest pain");
        return dto;
    }

    private void stubSaveAssigningId(Long id) {
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> {
            Appointment a = inv.getArgument(0);
            a.setId(id);
            return a;
        });
    }

    @Test
    void bookAppointment_createsPendingAppointmentForPatientAndDoctor() {
        when(patientRepository.findByUserId(100L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(5L)).thenReturn(Optional.of(doctor));
        stubSaveAssigningId(10L);

        Appointment result = appointmentService.bookAppointment(bookingRequest(), 100L);

        assertThat(result.getStatus()).isEqualTo(AppointmentStatus.PENDING);
        assertThat(result.getPatient()).isSameAs(patient);
        assertThat(result.getDoctor()).isSameAs(doctor);
        assertThat(result.getTimeSlot()).isEqualTo("10:00-10:30");
        assertThat(result.getSymptoms()).isEqualTo("Chest pain");
    }

    @Test
    void bookAppointment_createsPendingBillWithTheDoctorsConsultationFee() {
        when(patientRepository.findByUserId(100L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(5L)).thenReturn(Optional.of(doctor));
        stubSaveAssigningId(10L);

        appointmentService.bookAppointment(bookingRequest(), 100L);

        ArgumentCaptor<Billing> bill = ArgumentCaptor.forClass(Billing.class);
        verify(billingRepository).save(bill.capture());
        assertThat(bill.getValue().getAmount()).isEqualTo(150.0);
        assertThat(bill.getValue().getStatus()).isEqualTo(PaymentStatus.PENDING);
        assertThat(bill.getValue().getPatient()).isSameAs(patient);
        assertThat(bill.getValue().getDescription()).isEqualTo("Consultation fee for appointment #10");
    }

    @Test
    void bookAppointment_doctorWithoutFee_isBilledZero() {
        doctor.setConsultationFee(null);
        when(patientRepository.findByUserId(100L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(5L)).thenReturn(Optional.of(doctor));
        stubSaveAssigningId(11L);

        appointmentService.bookAppointment(bookingRequest(), 100L);

        ArgumentCaptor<Billing> bill = ArgumentCaptor.forClass(Billing.class);
        verify(billingRepository).save(bill.capture());
        assertThat(bill.getValue().getAmount()).isEqualTo(0.0);
    }

    @Test
    void bookAppointment_unknownPatient_throwsAndCreatesNothing() {
        when(patientRepository.findByUserId(100L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.bookAppointment(bookingRequest(), 100L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(appointmentRepository, never()).save(any(Appointment.class));
        verify(billingRepository, never()).save(any(Billing.class));
    }

    @Test
    void bookAppointment_unknownDoctor_throwsAndCreatesNothing() {
        when(patientRepository.findByUserId(100L)).thenReturn(Optional.of(patient));
        when(doctorRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.bookAppointment(bookingRequest(), 100L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(appointmentRepository, never()).save(any(Appointment.class));
        verify(billingRepository, never()).save(any(Billing.class));
    }

    @Test
    void updateStatus_changesStatusAndKeepsExistingNotesWhenNoneGiven() {
        Appointment existing = Appointment.builder().id(10L).status(AppointmentStatus.PENDING)
                .notes("original note").build();
        when(appointmentRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        StatusUpdateDTO dto = new StatusUpdateDTO();
        dto.setStatus("CONFIRMED");

        Appointment result = appointmentService.updateStatus(10L, dto);

        assertThat(result.getStatus()).isEqualTo(AppointmentStatus.CONFIRMED);
        assertThat(result.getNotes()).isEqualTo("original note");
    }

    @Test
    void updateStatus_replacesNotesWhenProvided() {
        Appointment existing = Appointment.builder().id(10L).status(AppointmentStatus.PENDING)
                .notes("original note").build();
        when(appointmentRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        StatusUpdateDTO dto = new StatusUpdateDTO();
        dto.setStatus("COMPLETED");
        dto.setNotes("follow-up in 2 weeks");

        Appointment result = appointmentService.updateStatus(10L, dto);

        assertThat(result.getStatus()).isEqualTo(AppointmentStatus.COMPLETED);
        assertThat(result.getNotes()).isEqualTo("follow-up in 2 weeks");
    }

    @Test
    void updateStatus_unknownStatusValue_isRejected() {
        Appointment existing = Appointment.builder().id(10L).status(AppointmentStatus.PENDING).build();
        when(appointmentRepository.findById(10L)).thenReturn(Optional.of(existing));

        StatusUpdateDTO dto = new StatusUpdateDTO();
        dto.setStatus("NOT_A_STATUS");

        assertThatThrownBy(() -> appointmentService.updateStatus(10L, dto))
                .isInstanceOf(IllegalArgumentException.class);

        verify(appointmentRepository, never()).save(any(Appointment.class));
    }

    @Test
    void updateStatus_missingAppointment_throwsNotFound() {
        when(appointmentRepository.findById(99L)).thenReturn(Optional.empty());

        StatusUpdateDTO dto = new StatusUpdateDTO();
        dto.setStatus("CONFIRMED");

        assertThatThrownBy(() -> appointmentService.updateStatus(99L, dto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteAppointment_missingAppointment_throwsNotFoundAndDeletesNothing() {
        when(appointmentRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> appointmentService.deleteAppointment(99L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(appointmentRepository, never()).deleteById(any(Long.class));
    }
}
