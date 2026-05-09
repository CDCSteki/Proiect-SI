package com.autoservice.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class MechanicWorkloadResponse {
    private UUID mechanicId;
    private String mechanicName;
    private Long appointmentsCount;
}