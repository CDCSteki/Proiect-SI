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
    return AppointmentStatusResponse.builder()
            .scheduled(appointmentRepository.countByStatus(Appointment.AppointmentStatus.SCHEDULED))
            .inProgress(appointmentRepository.countByStatus(Appointment.AppointmentStatus.IN_PROGRESS))
            .done(appointmentRepository.countByStatus(Appointment.AppointmentStatus.DONE))
            .cancelled(appointmentRepository.countByStatus(Appointment.AppointmentStatus.CANCELLED))
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

public DailyAppointmentsResponse getDailyAppointments(LocalDateTime date) {
    LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
    LocalDateTime endOfDay = startOfDay.plusDays(1);
    Long count = appointmentRepository.countByScheduledAtBetween(startOfDay, endOfDay);
    return DailyAppointmentsResponse.builder()
            .count(count != null ? count : 0L)
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