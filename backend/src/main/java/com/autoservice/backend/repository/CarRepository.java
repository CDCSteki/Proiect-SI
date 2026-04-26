package com.autoservice.backend.repository;

import com.autoservice.backend.model.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CarRepository extends JpaRepository<Car, UUID> {
    List<Car> findByClientId(UUID clientId);
}