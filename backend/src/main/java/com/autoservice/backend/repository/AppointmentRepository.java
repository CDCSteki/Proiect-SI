package com.autoservice.backend.repository;

import com.autoservice.backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByClientId(UUID clientId);
    List<Appointment> findByMechanicId(UUID mechanicId);
}