package com.autoservice.backend.repository;

import com.autoservice.backend.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Optional<Invoice> findByRepairRecordId(UUID repairRecordId);

    @Query("SELECT SUM(i.amount) FROM Invoice i WHERE i.isPaid = true")
    BigDecimal sumPaidInvoices();

    @Query("SELECT SUM(i.amount) FROM Invoice i WHERE i.isPaid = true AND i.repairRecord.appointment.scheduledAt BETWEEN :start AND :end")
    BigDecimal sumPaidInvoicesByPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}