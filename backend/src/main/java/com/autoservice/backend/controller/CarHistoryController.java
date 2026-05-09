package com.autoservice.backend.controller;

import com.autoservice.backend.dto.CarHistoryResponse;
import com.autoservice.backend.service.CarHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarHistoryController {

    private final CarHistoryService carHistoryService;

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('CLIENT', 'MECHANIC', 'MANAGER', 'ADMIN')")
    public ResponseEntity<CarHistoryResponse> getCarHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(carHistoryService.getCarHistory(id));
    }
}