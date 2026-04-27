package com.autoservice.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AppointmentRequest {
    private UUID carId;
    private LocalDateTime scheduledAt;
    private String serviceType;
    private String notes;
}