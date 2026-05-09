package com.autoservice.backend.dto;

import com.autoservice.backend.model.Appointment.AppointmentStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CarHistoryResponse {
    private UUID carId;
    private String licensePlate;
    private String make;
    private String model;
    private int year;
    private List<RepairEntry> repairs;

    @Data
    @Builder
    public static class RepairEntry {
        private UUID appointmentId;
        private LocalDateTime scheduledAt;
        private String serviceType;
        private AppointmentStatus status;
        private String diagnosis;
        private BigDecimal totalCost;
        private List<String> partsUsed;
    }
}