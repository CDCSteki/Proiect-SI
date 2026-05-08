package com.autoservice.backend.controller;

import com.autoservice.backend.dto.InvoiceResponse;
import com.autoservice.backend.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/repair-record/{repairRecordId}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<InvoiceResponse> generate(
            @PathVariable UUID repairRecordId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invoiceService.generate(repairRecordId));
    }

    @GetMapping("/repair-record/{repairRecordId}")
    @PreAuthorize("hasAnyRole('CLIENT', 'MANAGER', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> getByRepairRecord(
            @PathVariable UUID repairRecordId
    ) {
        return ResponseEntity.ok(invoiceService.getByRepairRecord(repairRecordId));
    }

    @PatchMapping("/{id}/pay")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<InvoiceResponse> markAsPaid(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(invoiceService.markAsPaid(id));
    }
}