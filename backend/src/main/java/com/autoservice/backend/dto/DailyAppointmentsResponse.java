package com.autoservice.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DailyAppointmentsResponse {
    private Long count;
}