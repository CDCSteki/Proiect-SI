package com.autoservice.backend.service;

import com.autoservice.backend.dto.AppointmentStatusResponse;
import com.autoservice.backend.dto.DailyAppointmentsResponse;
import com.autoservice.backend.dto.RevenueResponse;
import com.autoservice.backend.dto.UserCountResponse;
import com.autoservice.backend.dto.MechanicWorkloadResponse;
import com.autoservice.backend.model.Appointment;
import com.autoservice.backend.repository.AppointmentRepository;
import com.autoservice.backend.repository.InvoiceRepository;
import com.autoservice.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository invoiceRepository;

    public UserCountResponse getUsersCountByRole() {
        return UserCountResponse.builder()
                .clients(userRepository.countClients())
                .mechanics(userRepository.countMechanics())
                .managers(userRepository.countManagers())
                .admins(userRepository.countAdmins())
                .build();
    }

    public AppointmentStatusResponse getAppointmentsByStatus() {
        long scheduled = appointmentRepository.countByStatus(Appointment.AppointmentStatus.SCHEDULED);
        long inProgress = appointmentRepository.countByStatus(Appointment.AppointmentStatus.IN_PROGRESS);
        long done = appointmentRepository.countByStatus(Appointment.AppointmentStatus.DONE);
        long readyForPickup = appointmentRepository.countByStatus(Appointment.AppointmentStatus.READY_FOR_PICKUP);
        long cancelled = appointmentRepository.countByStatus(Appointment.AppointmentStatus.CANCELLED);

        long total = scheduled + inProgress + done + readyForPickup + cancelled;
        double completionRate = total == 0 ? 0.0 : ((double) (done + readyForPickup) / total) * 100;

        return AppointmentStatusResponse.builder()
                .scheduled(scheduled)
                .inProgress(inProgress)
                .done(done + readyForPickup)
                .readyForPickup(readyForPickup)
                .cancelled(cancelled)
                .completionRate(completionRate)
                .build();
    }

    public DailyAppointmentsResponse getAppointmentsCount(LocalDateTime start, LocalDateTime end) {
        Long count = appointmentRepository.countByScheduledAtBetween(start, end);
        return DailyAppointmentsResponse.builder()
                .count(count != null ? count : 0L)
                .build();
    }

    public RevenueResponse getTotalRevenue() {
        BigDecimal total = invoiceRepository.sumPaidInvoices();
        return RevenueResponse.builder()
                .total(total != null ? total : BigDecimal.ZERO)
                .build();
    }

    public RevenueResponse getRevenueByPeriod(LocalDateTime start, LocalDateTime end) {
        BigDecimal revenue = invoiceRepository.sumPaidInvoicesByPeriod(start, end);
        return RevenueResponse.builder()
                .total(revenue != null ? revenue : BigDecimal.ZERO)
                .build();
    }

    public List<MechanicWorkloadResponse> getMechanicWorkload() {
        List<Object[]> results = appointmentRepository.countAppointmentsPerMechanic();
        List<MechanicWorkloadResponse> response = new ArrayList<>();

        for (Object[] row : results) {
            response.add(MechanicWorkloadResponse.builder()
                    .mechanicId(UUID.fromString(row[0].toString()))
                    .mechanicName(row[1] + " " + row[2])
                    .appointmentsCount((Long) row[3])
                    .build());
        }

        return response;
    }
}