package com.autoservice.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PartRequest {
    private String name;
    private BigDecimal price;
    private int quantity;
}