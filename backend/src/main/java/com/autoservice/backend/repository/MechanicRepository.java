package com.autoservice.backend.repository;

import com.autoservice.backend.model.Mechanic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface MechanicRepository extends JpaRepository<Mechanic, UUID> {
}