package com.autoservice.backend.repository;

import com.autoservice.backend.model.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PartRepository extends JpaRepository<Part, UUID> {
    List<Part> findByRepairRecordId(UUID repairRecordId);
}