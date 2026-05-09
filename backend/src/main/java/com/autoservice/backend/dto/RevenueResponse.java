package com.autoservice.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class RevenueResponse {
    private BigDecimal total;
}