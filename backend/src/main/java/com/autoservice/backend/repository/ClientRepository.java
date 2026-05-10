package com.autoservice.backend.repository;

import com.autoservice.backend.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {
    @Modifying
    @Query(value = "DELETE FROM clients WHERE id = :id", nativeQuery = true)
    void deleteByIdNative(@Param("id") UUID id);

    @Modifying
    @Query(value = "INSERT INTO clients (id) VALUES (:id)", nativeQuery = true)
    void insertNative(@Param("id") UUID id);
}