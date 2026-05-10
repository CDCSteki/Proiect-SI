package com.autoservice.backend.repository;

import com.autoservice.backend.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface AdminRepository extends JpaRepository<Admin, UUID> {
    @Modifying
    @Query(value = "DELETE FROM admins WHERE id = :id", nativeQuery = true)
    void deleteByIdNative(@Param("id") UUID id);

    @Modifying
    @Query(value = "INSERT INTO admins (id, access_level) VALUES (:id, :accessLevel)", nativeQuery = true)
    void insertNative(@Param("id") UUID id, @Param("accessLevel") int accessLevel);
}