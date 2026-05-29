package com.autoservice.backend.controller;

import com.autoservice.backend.dto.AppointmentRequest;
import com.autoservice.backend.dto.AppointmentResponse;
import com.autoservice.backend.model.Appointment.AppointmentStatus;
import com.autoservice.backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<AppointmentResponse> book(
            @RequestBody AppointmentRequest request,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        AppointmentResponse response = appointmentService.book(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.getMyAppointments(userId));
    }

    @GetMapping("/tasks")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<List<AppointmentResponse>> getMyTasks(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            Authentication authentication) {
        UUID mechanicId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(appointmentService.getMyTasks(mechanicId, from, to));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('MECHANIC') or hasRole('MANAGER')")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam AppointmentStatus status,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();

        boolean isManager = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER"));

        if (isManager) {
            return ResponseEntity.ok(appointmentService.updateStatusByManager(id, status));
        }

        return ResponseEntity.ok(appointmentService.updateStatus(id, status, userId));
    }

    @GetMapping("/unassigned")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getUnassigned() {
        return ResponseEntity.ok(appointmentService.getUnassignedAppointments());
    }

    @GetMapping("/available-slots")
    @PreAuthorize("hasAnyRole('CLIENT', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<String>> getAvailableSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        return ResponseEntity.ok(appointmentService.getAvailableSlots(date));
    }

    @GetMapping("/fully-booked-dates")
    public ResponseEntity<List<String>> getFullyBookedDates(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(appointmentService.getFullyBookedDates(year, month));
    }

    @GetMapping("/calendar")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<AppointmentResponse>> getCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(appointmentService.getCalendar(from, to));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponse> assignMechanic(
            @PathVariable UUID id,
            @RequestParam UUID mechanicId) {
        return ResponseEntity.ok(appointmentService.assignMechanic(id, mechanicId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        appointmentService.cancel(id, userId);
        return ResponseEntity.noContent().build();
    }
}