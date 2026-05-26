package com.autoservice.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class RepairRecordResponse {
    private UUID id;
    private UUID appointmentId;
    private String diagnosis;
    private BigDecimal laborHours;
    private BigDecimal laborCost;
    private BigDecimal mechanicHourlyRate;
    private BigDecimal totalCost;
    private List<PartResponse> parts;

    @Data
    public static class PartResponse {
        private UUID id;
        private String name;
        private BigDecimal price;
        private int quantity;
        private BigDecimal totalPrice;
    }
}