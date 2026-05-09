package com.autoservice.backend.controller;

import com.autoservice.backend.dto.AppointmentStatusResponse;
import com.autoservice.backend.dto.DailyAppointmentsResponse;
import com.autoservice.backend.dto.RevenueResponse;
import com.autoservice.backend.dto.UserCountResponse;
import com.autoservice.backend.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/users-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserCountResponse> getUsersCount() {
        return ResponseEntity.ok(statsService.getUsersCountByRole());
    }

    @GetMapping("/appointments-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AppointmentStatusResponse> getAppointmentsByStatus() {
        return ResponseEntity.ok(statsService.getAppointmentsByStatus());
    }

    @GetMapping("/total-revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RevenueResponse> getTotalRevenue() {
        return ResponseEntity.ok(statsService.getTotalRevenue());
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<RevenueResponse> getRevenueByPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(statsService.getRevenueByPeriod(startDate, endDate));
    }

    @GetMapping("/daily-appointments")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<DailyAppointmentsResponse> getDailyAppointments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date) {
        return ResponseEntity.ok(statsService.getDailyAppointments(date));
    }
}