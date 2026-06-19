package com.hospital.repository;

import com.hospital.entity.Billing;
import com.hospital.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillingRepository extends JpaRepository<Billing, Long> {
    List<Billing> findByPatientId(Long patientId);
    List<Billing> findByStatus(PaymentStatus status);

    @Query("SELECT SUM(b.amount) FROM Billing b WHERE b.status = 'PAID'")
    Double getTotalRevenue();

    @Query("SELECT SUM(b.amount) FROM Billing b WHERE b.patient.id = :patientId")
    Double getTotalByPatient(Long patientId);
}
