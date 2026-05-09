package com.autoservice.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AppointmentStatusResponse {
    private Long scheduled;
    private Long inProgress;
    private Long done;
    private Long cancelled;
}