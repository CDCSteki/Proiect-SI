package com.autoservice.backend.service;

import com.autoservice.backend.dto.AvailableMechanicResponse;
import com.autoservice.backend.dto.MechanicLeaveRequest;
import com.autoservice.backend.dto.MechanicLeaveResponse;
import com.autoservice.backend.exception.BadRequestException;
import com.autoservice.backend.exception.ConflictException;
import com.autoservice.backend.exception.ResourceNotFoundException;
import com.autoservice.backend.model.Mechanic;
import com.autoservice.backend.model.MechanicLeave;
import com.autoservice.backend.repository.AppointmentRepository;
import com.autoservice.backend.repository.MechanicLeaveRepository;
import com.autoservice.backend.repository.MechanicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MechanicLeaveService {

    private final MechanicLeaveRepository mechanicLeaveRepository;
    private final MechanicRepository mechanicRepository;
    private final AppointmentRepository appointmentRepository;

    // ── MECHANIC ──

    public MechanicLeaveResponse requestLeave(UUID mechanicId, MechanicLeaveRequest request) {
        Mechanic mechanic = mechanicRepository.findById(mechanicId)
                .orElseThrow(() -> new ResourceNotFoundException("Mechanic not found"));

        if (request.getStartDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot request leave in the past.");
        }

        if (request.getStartDate().isBefore(LocalDateTime.now().plusHours(24))) {
            throw new BadRequestException("Leave must be requested at least 24 hours in advance.");
        }

        // 3. Verifici programarile existente
        List<?> conflicts = appointmentRepository
                .findByMechanicIdAndScheduledAtBetweenOrderByScheduledAt(
                        mechanicId,
                        request.getStartDate(),
                        request.getEndDate()
                );

        if (!conflicts.isEmpty()) {
            throw new ConflictException("You have appointments during this period.");
        }

        MechanicLeave leave = MechanicLeave.builder()
                .mechanic(mechanic)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .build();

        mechanicLeaveRepository.save(leave);
        return mapToResponse(leave);
    }

    public List<MechanicLeaveResponse> getMyLeaves(UUID mechanicId) {
        return mechanicLeaveRepository.findByMechanicId(mechanicId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteLeave(UUID leaveId) {
        MechanicLeave leave = mechanicLeaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found"));

        if (leave.getStatus() == MechanicLeave.LeaveStatus.APPROVED) {
            throw new BadRequestException("Cannot delete an approved leave.");
        }

        mechanicLeaveRepository.deleteById(leaveId);
    }

    // ── MANAGER ──

    public List<MechanicLeaveResponse> getAllLeaves() {
        return mechanicLeaveRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<MechanicLeaveResponse> getPendingLeaves() {
        return mechanicLeaveRepository.findByStatus(MechanicLeave.LeaveStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public MechanicLeaveResponse approveLeave(UUID leaveId, boolean approved) {
        MechanicLeave leave = mechanicLeaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found"));

        if (leave.getStatus() != MechanicLeave.LeaveStatus.PENDING) {
            throw new ConflictException("Leave already processed.");
        }

        leave.setStatus(approved ?
                MechanicLeave.LeaveStatus.APPROVED :
                MechanicLeave.LeaveStatus.REJECTED);

        mechanicLeaveRepository.save(leave);
        return mapToResponse(leave);
    }

    public List<AvailableMechanicResponse> getAvailableMechanics(LocalDateTime timeSlot) {
        List<Mechanic> allMechanics = mechanicRepository.findAll();

        return allMechanics.stream()
                .filter(mechanic -> {
                    boolean hasConflict = appointmentRepository
                            .existsConflict(mechanic.getId(), timeSlot);

                    boolean onLeave = !mechanicLeaveRepository
                            .findConflicts(mechanic.getId(), timeSlot, timeSlot)
                            .isEmpty();

                    return !hasConflict && !onLeave;
                })
                .map(m -> AvailableMechanicResponse.builder()
                        .mechanicId(m.getId())
                        .firstName(m.getFirstName())
                        .lastName(m.getLastName())
                        .specialization(m.getSpecialization())
                        .build())
                .collect(Collectors.toList());
    }

    private MechanicLeaveResponse mapToResponse(MechanicLeave leave) {
        return MechanicLeaveResponse.builder()
                .id(leave.getId())
                .mechanicId(leave.getMechanic().getId())
                .mechanicName(leave.getMechanic().getFirstName() + " " + leave.getMechanic().getLastName())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .reason(leave.getReason())
                .status(leave.getStatus().name())
                .build();
    }
}