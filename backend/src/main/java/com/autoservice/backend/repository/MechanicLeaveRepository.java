package com.autoservice.backend.repository;

import com.autoservice.backend.model.MechanicLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MechanicLeaveRepository extends JpaRepository<MechanicLeave, UUID> {

    List<MechanicLeave> findByMechanicId(UUID mechanicId);

    List<MechanicLeave> findByStatus(MechanicLeave.LeaveStatus status);

    List<MechanicLeave> findByMechanicIdAndStatus(UUID mechanicId, MechanicLeave.LeaveStatus status);

    @Query("""
            SELECT ml FROM MechanicLeave ml
            WHERE ml.mechanic.id = :mechanicId
            AND ml.status = 'APPROVED'
            AND ml.startDate <= :end
            AND ml.endDate >= :start
            """)
    List<MechanicLeave> findConflicts(
            @Param("mechanicId") UUID mechanicId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}