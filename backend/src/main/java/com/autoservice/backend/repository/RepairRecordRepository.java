package com.autoservice.backend.repository;

import com.autoservice.backend.model.RepairRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RepairRecordRepository extends JpaRepository<RepairRecord, UUID> {
    Optional<RepairRecord> findByAppointmentId(UUID appointmentId);
}