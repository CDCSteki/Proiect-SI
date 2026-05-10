package com.autoservice.backend.service;

import com.autoservice.backend.dto.CarHistoryResponse;
import com.autoservice.backend.exception.ResourceNotFoundException;
import com.autoservice.backend.model.Appointment;
import com.autoservice.backend.model.Car;
import com.autoservice.backend.repository.AppointmentRepository;
import com.autoservice.backend.repository.CarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarHistoryService {

    private final CarRepository carRepository;
    private final AppointmentRepository appointmentRepository;

    public CarHistoryResponse getCarHistory(UUID carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found"));

        List<Appointment> appointments = appointmentRepository.findByCarId(carId);

        List<CarHistoryResponse.RepairEntry> repairs = appointments.stream()
                .map(a -> {
                    CarHistoryResponse.RepairEntry.RepairEntryBuilder entry =
                            CarHistoryResponse.RepairEntry.builder()
                                    .appointmentId(a.getId())
                                    .scheduledAt(a.getScheduledAt())
                                    .serviceType(a.getServiceType())
                                    .status(a.getStatus());

                    if (a.getRepairRecord() != null) {
                        entry.diagnosis(a.getRepairRecord().getDiagnosis());
                        entry.totalCost(a.getRepairRecord().getTotalCost());
                        entry.partsUsed(
                                a.getRepairRecord().getParts() != null
                                        ? a.getRepairRecord().getParts()
                                                .stream()
                                                .map(p -> p.getName() + " x" + p.getQuantity())
                                                .collect(Collectors.toList())
                                        : List.of()
                        );
                    }

                    return entry.build();
                })
                .collect(Collectors.toList());

        return CarHistoryResponse.builder()
                .carId(car.getId())
                .licensePlate(car.getLicensePlate())
                .make(car.getMake())
                .model(car.getModel())
                .year(car.getYear())
                .repairs(repairs)
                .build();
    }
}