package com.autoservice.backend.controller;

import com.autoservice.backend.dto.PartRequest;
import com.autoservice.backend.dto.RepairRecordRequest;
import com.autoservice.backend.dto.RepairRecordResponse;
import com.autoservice.backend.service.RepairRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/repair-records")
@RequiredArgsConstructor
public class RepairRecordController {

    private final RepairRecordService repairRecordService;

    @PostMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<RepairRecordResponse> create(
            @PathVariable UUID appointmentId,
            @RequestBody RepairRecordRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(repairRecordService.createRepairRecord(appointmentId, request));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('MECHANIC', 'MANAGER', 'CLIENT')")
    public ResponseEntity<RepairRecordResponse> getByAppointment(
            @PathVariable UUID appointmentId
    ) {
        return ResponseEntity.ok(repairRecordService.getByAppointmentId(appointmentId));
    }

    @PostMapping("/{id}/parts")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<RepairRecordResponse> addPart(
            @PathVariable UUID id,
            @RequestBody PartRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(repairRecordService.addPart(id, request));
    }

    @DeleteMapping("/parts/{partId}")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<Void> deletePart(@PathVariable UUID partId) {
        repairRecordService.deletePart(partId);
        return ResponseEntity.noContent().build();
    }
}