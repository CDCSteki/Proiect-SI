package com.autoservice.backend.dto;

import com.autoservice.backend.model.Appointment.AppointmentStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AppointmentResponse {
    private UUID id;
    private UUID clientId;
    private UUID mechanicId;
    private String serviceType;
    private String notes;
    private LocalDateTime scheduledAt;
    private AppointmentStatus status;
    private CarInfo car;

    @Data
    public static class CarInfo {
        private UUID id;
        private String licensePlate;
        private String make;
        private String model;
        private int year;
    }
}