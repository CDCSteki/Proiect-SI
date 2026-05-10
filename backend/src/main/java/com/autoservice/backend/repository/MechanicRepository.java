package com.autoservice.backend.repository;

import com.autoservice.backend.model.Mechanic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface MechanicRepository extends JpaRepository<Mechanic, UUID> {
    @Modifying
    @Query(value = "DELETE FROM mechanics WHERE id = :id", nativeQuery = true)
    void deleteByIdNative(@Param("id") UUID id);

    @Modifying
    @Query(value = "INSERT INTO mechanics (id, specialization, hourly_rate) VALUES (:id, :specialization, :hourlyRate)", nativeQuery = true)
    void insertNative(@Param("id") UUID id, @Param("specialization") String specialization, @Param("hourlyRate") double hourlyRate);
}