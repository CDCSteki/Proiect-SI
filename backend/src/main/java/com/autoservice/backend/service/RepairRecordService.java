package com.autoservice.backend.service;

import com.autoservice.backend.exception.ResourceNotFoundException;
import com.autoservice.backend.dto.PartRequest;
import com.autoservice.backend.dto.RepairRecordRequest;
import com.autoservice.backend.dto.RepairRecordResponse;
import com.autoservice.backend.model.Appointment;
import com.autoservice.backend.model.Part;
import com.autoservice.backend.model.RepairRecord;
import com.autoservice.backend.repository.AppointmentRepository;
import com.autoservice.backend.repository.PartRepository;
import com.autoservice.backend.repository.RepairRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RepairRecordService {

    private final RepairRecordRepository repairRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final PartRepository partRepository;

    public RepairRecordResponse createRepairRecord(UUID appointmentId, RepairRecordRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        RepairRecord record = new RepairRecord();
        record.setAppointment(appointment);
        record.setDiagnosis(request.getDiagnosis());
        record.setLaborHours(request.getLaborHours());
        record.setTotalCost(BigDecimal.ZERO);

        repairRecordRepository.save(record);
        return mapToResponse(record);
    }

    public RepairRecordResponse addPart(UUID repairRecordId, PartRequest request) {
        RepairRecord record = repairRecordRepository.findById(repairRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair record not found"));

        Part part = new Part();
        part.setRepairRecord(record);
        part.setName(request.getName());
        part.setPrice(request.getPrice());
        part.setQuantity(request.getQuantity());
        partRepository.save(part);

        // Recalculate total cost
        BigDecimal totalParts = partRepository.findByRepairRecordId(repairRecordId)
                .stream()
                .map(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        record.setTotalCost(totalParts);
        repairRecordRepository.save(record);

        return mapToResponse(record);
    }

    public RepairRecordResponse getByAppointmentId(UUID appointmentId) {
        RepairRecord record = repairRecordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Repair record not found"));
        return mapToResponse(record);
    }

    public void deletePart(UUID partId) {
        partRepository.deleteById(partId);
    }

    private RepairRecordResponse mapToResponse(RepairRecord record) {
        RepairRecordResponse response = new RepairRecordResponse();
        response.setId(record.getId());
        response.setAppointmentId(record.getAppointment().getId());
        response.setDiagnosis(record.getDiagnosis());
        response.setLaborHours(record.getLaborHours());
        response.setTotalCost(record.getTotalCost());

        if (record.getParts() != null) {
            response.setParts(record.getParts().stream().map(p -> {
                RepairRecordResponse.PartResponse pr = new RepairRecordResponse.PartResponse();
                pr.setId(p.getId());
                pr.setName(p.getName());
                pr.setPrice(p.getPrice());
                pr.setQuantity(p.getQuantity());
                pr.setTotalPrice(p.getPrice().multiply(BigDecimal.valueOf(p.getQuantity())));
                return pr;
            }).collect(Collectors.toList()));
        }

        return response;
    }
}