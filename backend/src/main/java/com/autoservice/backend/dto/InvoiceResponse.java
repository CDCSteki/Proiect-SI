package com.autoservice.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class InvoiceResponse {
    private UUID id;
    private UUID repairRecordId;
    private String invoiceNumber;
    private BigDecimal amount;
    private boolean isPaid;
    private BigDecimal laborCost;
    private BigDecimal mechanicHourlyRate;
}