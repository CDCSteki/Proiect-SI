package com.autoservice.backend.repository;

import com.autoservice.backend.model.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ManagerRepository extends JpaRepository<Manager, UUID> {
    @Modifying
    @Query(value = "DELETE FROM managers WHERE id = :id", nativeQuery = true)
    void deleteByIdNative(@Param("id") UUID id);

    @Modifying
    @Query(value = "INSERT INTO managers (id, department) VALUES (:id, :department)", nativeQuery = true)
    void insertNative(@Param("id") UUID id, @Param("department") String department);
}