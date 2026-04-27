package com.autoservice.backend.service;

import com.autoservice.backend.dto.AppointmentRequest;
import com.autoservice.backend.dto.AppointmentResponse;
import com.autoservice.backend.model.Appointment;
import com.autoservice.backend.model.Car;
import com.autoservice.backend.model.Client;
import com.autoservice.backend.model.Mechanic;
import com.autoservice.backend.repository.AppointmentRepository;
import com.autoservice.backend.repository.CarRepository;
import com.autoservice.backend.repository.ClientRepository;
import com.autoservice.backend.repository.MechanicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CarRepository carRepository;
    private final ClientRepository clientRepository;
    private final MechanicRepository mechanicRepository;

    public AppointmentResponse book(AppointmentRequest request, UUID clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new RuntimeException("Car not found"));

        if (!car.getClient().getId().equals(clientId)) {
            throw new RuntimeException("This car does not belong to you");
        }

        Appointment appointment = new Appointment();
        appointment.setClient(client);
        appointment.setCar(car);
        appointment.setScheduledAt(request.getScheduledAt());
        appointment.setServiceType(request.getServiceType());
        appointment.setNotes(request.getNotes());
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);

        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    public List<AppointmentResponse> getMyAppointments(UUID clientId) {
        return appointmentRepository.findByClientId(clientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AppointmentResponse updateStatus(UUID appointmentId,
                                            Appointment.AppointmentStatus status,
                                            UUID mechanicId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getMechanic() == null ||
                !appointment.getMechanic().getId().equals(mechanicId)) {
            throw new RuntimeException("You are not assigned to this appointment");
        }

        appointment.setStatus(status);
        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    public AppointmentResponse assignMechanic(UUID appointmentId, UUID mechanicId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Mechanic mechanic = mechanicRepository.findById(mechanicId)
                .orElseThrow(() -> new RuntimeException("Mechanic not found"));

        appointment.setMechanic(mechanic);
        appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    public void cancel(UUID appointmentId, UUID clientId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getClient().getId().equals(clientId)) {
            throw new RuntimeException("You can only cancel your own appointments");
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.IN_PROGRESS ||
                appointment.getStatus() == Appointment.AppointmentStatus.DONE) {
            throw new RuntimeException("Cannot cancel an appointment that is already in progress or done");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setClientId(appointment.getClient().getId());
        response.setScheduledAt(appointment.getScheduledAt());
        response.setServiceType(appointment.getServiceType());
        response.setNotes(appointment.getNotes());
        response.setStatus(appointment.getStatus());

        if (appointment.getMechanic() != null) {
            response.setMechanicId(appointment.getMechanic().getId());
        }

        AppointmentResponse.CarInfo carInfo = new AppointmentResponse.CarInfo();
        carInfo.setId(appointment.getCar().getId());
        carInfo.setLicensePlate(appointment.getCar().getLicensePlate());
        carInfo.setMake(appointment.getCar().getMake());
        carInfo.setModel(appointment.getCar().getModel());
        carInfo.setYear(appointment.getCar().getYear());
        response.setCar(carInfo);

        return response;
    }
}