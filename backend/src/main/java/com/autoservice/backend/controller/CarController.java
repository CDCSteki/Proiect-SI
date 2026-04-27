package com.autoservice.backend.controller;

import com.autoservice.backend.dto.CarRequest;
import com.autoservice.backend.dto.CarResponse;
import com.autoservice.backend.service.CarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    @PostMapping
    public ResponseEntity<CarResponse> addCar(
            @RequestBody CarRequest request,
            Authentication authentication
    ) {
        // Extragem direct UUID-ul salvat de JwtAuthFilter
        UUID userId = (UUID) authentication.getPrincipal();
        CarResponse response = carService.addCar(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<CarResponse>> getMyCars(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(carService.getMyCars(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCar(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        carService.deleteCar(id, userId);
        return ResponseEntity.noContent().build();
    }
}