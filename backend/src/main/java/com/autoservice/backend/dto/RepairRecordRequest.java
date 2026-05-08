package com.autoservice.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RepairRecordRequest {
    private String diagnosis;
    private BigDecimal laborHours;
}