package com.autoservice.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class MechanicLeaveResponse {
    private UUID id;
    private UUID mechanicId;
    private String mechanicName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String reason;
    private String status;
}