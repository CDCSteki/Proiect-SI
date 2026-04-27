package com.autoservice.backend.controller;

import com.autoservice.backend.dto.AppointmentRequest;
import com.autoservice.backend.dto.AppointmentResponse;
import com.autoservice.backend.model.Appointment.AppointmentStatus;
import com.autoservice.backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponse> book(
            @RequestBody AppointmentRequest request,
            Authentication authentication
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        AppointmentResponse response = appointmentService.book(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.getMyAppointments(userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam AppointmentStatus status,
            Authentication authentication
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.updateStatus(id, status, userId));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<AppointmentResponse> assignMechanic(
            @PathVariable UUID id,
            @RequestParam UUID mechanicId
    ) {
        return ResponseEntity.ok(appointmentService.assignMechanic(id, mechanicId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        UUID userId = (UUID) authentication.getPrincipal();
        appointmentService.cancel(id, userId);
        return ResponseEntity.noContent().build();
    }
}