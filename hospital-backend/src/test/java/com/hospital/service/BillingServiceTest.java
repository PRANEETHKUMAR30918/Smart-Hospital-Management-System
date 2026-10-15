package com.hospital.service;

import com.hospital.entity.Billing;
import com.hospital.entity.Patient;
import com.hospital.entity.PaymentStatus;
import com.hospital.entity.User;
import com.hospital.repository.BillingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock private BillingRepository billingRepository;
    @InjectMocks private BillingService billingService;

    @Test
    void processPayment_unauthorizedPatient_throwsAccessDeniedException() {
        User owner = User.builder().id(100L).build();
        Patient patient = Patient.builder().id(1L).user(owner).build();
        Billing billing = Billing.builder().id(10L).patient(patient).status(PaymentStatus.PENDING).build();

        when(billingRepository.findById(10L)).thenReturn(Optional.of(billing));

        // User 200 attempts to pay or modify User 100's bill
        assertThatThrownBy(() -> billingService.processPayment(10L, "CASH", 200L))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("not authorized");
    }

    @Test
    void processPayment_ownerPatient_succeeds() {
        User owner = User.builder().id(100L).build();
        Patient patient = Patient.builder().id(1L).user(owner).build();
        Billing billing = Billing.builder().id(10L).patient(patient).status(PaymentStatus.PENDING).build();

        when(billingRepository.findById(10L)).thenReturn(Optional.of(billing));
        when(billingRepository.save(billing)).thenReturn(billing);

        Billing paid = billingService.processPayment(10L, "CARD", 100L);
        assertThat(paid.getStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(paid.getPaymentMethod()).isEqualTo("CARD");
    }
}
