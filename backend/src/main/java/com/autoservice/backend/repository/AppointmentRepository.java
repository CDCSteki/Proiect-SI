package com.autoservice.backend.repository;

import com.autoservice.backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByClientId(UUID clientId);

    List<Appointment> findByMechanicId(UUID mechanicId);

    List<Appointment> findByMechanicIdAndScheduledAtBetweenOrderByScheduledAt(
            UUID mechanicId,
            LocalDateTime from,
            LocalDateTime to);

    Long countByStatus(Appointment.AppointmentStatus status);

    Long countByScheduledAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT a.mechanic.id, a.mechanic.firstName, a.mechanic.lastName, COUNT(a) " +
            "FROM Appointment a WHERE a.mechanic IS NOT NULL " +
            "GROUP BY a.mechanic.id, a.mechanic.firstName, a.mechanic.lastName")
    List<Object[]> countAppointmentsPerMechanic();

    @Query("SELECT a FROM Appointment a WHERE a.car.id = :carId ORDER BY a.scheduledAt DESC")
    List<Appointment> findByCarId(@Param("carId") UUID carId);

    @Query("""
            SELECT COUNT(a) > 0 FROM Appointment a
            WHERE a.mechanic.id = :mechanicId
            AND a.scheduledAt = :scheduledAt
            AND a.status NOT IN ('CANCELLED', 'DONE')
            """)
    boolean existsConflict(
            @Param("mechanicId") UUID mechanicId,
            @Param("scheduledAt") LocalDateTime scheduledAt);
}