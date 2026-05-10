package com.autoservice.backend.controller;

import com.autoservice.backend.dto.AvailableMechanicResponse;
import com.autoservice.backend.dto.MechanicLeaveRequest;
import com.autoservice.backend.dto.MechanicLeaveResponse;
import com.autoservice.backend.service.MechanicLeaveService;
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
@RequestMapping("/api/mechanics")
@RequiredArgsConstructor
public class MechanicLeaveController {

    private final MechanicLeaveService mechanicLeaveService;

    // ── MECHANIC ──

    @PostMapping("/time-off")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<MechanicLeaveResponse> requestLeave(
            @RequestBody MechanicLeaveRequest request,
            Authentication authentication
    ) {
        UUID mechanicId = (UUID) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mechanicLeaveService.requestLeave(mechanicId, request));
    }

    @GetMapping("/time-off")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<List<MechanicLeaveResponse>> getMyLeaves(
            Authentication authentication
    ) {
        UUID mechanicId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(mechanicLeaveService.getMyLeaves(mechanicId));
    }

    @DeleteMapping("/time-off/{id}")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<Void> deleteLeave(@PathVariable UUID id) {
        mechanicLeaveService.deleteLeave(id);
        return ResponseEntity.noContent().build();
    }

    // ── MANAGER / ADMIN ──

    @GetMapping("/time-off/all")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<MechanicLeaveResponse>> getAllLeaves() {
        return ResponseEntity.ok(mechanicLeaveService.getAllLeaves());
    }

    @GetMapping("/time-off/pending")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<MechanicLeaveResponse>> getPendingLeaves() {
        return ResponseEntity.ok(mechanicLeaveService.getPendingLeaves());
    }

    @PatchMapping("/time-off/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<MechanicLeaveResponse> approveLeave(
            @PathVariable UUID id,
            @RequestParam boolean approved
    ) {
        return ResponseEntity.ok(mechanicLeaveService.approveLeave(id, approved));
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<AvailableMechanicResponse>> getAvailableMechanics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime timeSlot
    ) {
        return ResponseEntity.ok(mechanicLeaveService.getAvailableMechanics(timeSlot));
    }
}