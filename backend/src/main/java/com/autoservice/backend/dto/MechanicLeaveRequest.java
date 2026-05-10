package com.autoservice.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MechanicLeaveRequest {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String reason;
}