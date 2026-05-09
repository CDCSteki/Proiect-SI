package com.autoservice.backend.service;

import com.autoservice.backend.exception.ResourceNotFoundException;
import com.autoservice.backend.dto.InvoiceResponse;
import com.autoservice.backend.model.Invoice;
import com.autoservice.backend.model.RepairRecord;
import com.autoservice.backend.repository.InvoiceRepository;
import com.autoservice.backend.repository.RepairRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final RepairRecordRepository repairRecordRepository;

    public InvoiceResponse generate(UUID repairRecordId) {
        RepairRecord record = repairRecordRepository.findById(repairRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair record not found"));

        Invoice invoice = new Invoice();
        invoice.setRepairRecord(record);
        invoice.setInvoiceNumber("INV-" + System.currentTimeMillis());
        invoice.setAmount(record.getTotalCost());
        invoice.setPaid(false);

        invoiceRepository.save(invoice);
        return mapToResponse(invoice);
    }

    public InvoiceResponse markAsPaid(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        invoice.setPaid(true);
        invoiceRepository.save(invoice);
        return mapToResponse(invoice);
    }

    public InvoiceResponse getByRepairRecord(UUID repairRecordId) {
        Invoice invoice = invoiceRepository.findByRepairRecordId(repairRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        return mapToResponse(invoice);
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        InvoiceResponse response = new InvoiceResponse();
        response.setId(invoice.getId());
        response.setRepairRecordId(invoice.getRepairRecord().getId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setAmount(invoice.getAmount());
        response.setPaid(invoice.isPaid());
        return response;
    }
}