package com.autoservice.backend.service;

import com.autoservice.backend.dto.CarRequest;
import com.autoservice.backend.dto.CarResponse;
import com.autoservice.backend.model.Car;
import com.autoservice.backend.model.Client;
import com.autoservice.backend.repository.CarRepository;
import com.autoservice.backend.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;
    private final ClientRepository clientRepository;

    public CarResponse addCar(CarRequest request, UUID clientId) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        Car car = new Car();
        car.setClient(client);
        car.setLicensePlate(request.getLicensePlate());
        car.setMake(request.getMake());
        car.setModel(request.getModel());
        car.setYear(request.getYear());

        carRepository.save(car);
        return mapToResponse(car);
    }

    public List<CarResponse> getMyCars(UUID clientId) {
        return carRepository.findByClientId(clientId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deleteCar(UUID carId, UUID clientId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        if (!car.getClient().getId().equals(clientId)) {
            throw new RuntimeException("This car does not belong to you");
        }

        carRepository.delete(car);
    }

    private CarResponse mapToResponse(Car car) {
        CarResponse response = new CarResponse();
        response.setId(car.getId());
        response.setLicensePlate(car.getLicensePlate());
        response.setMake(car.getMake());
        response.setModel(car.getModel());
        response.setYear(car.getYear());
        response.setClientId(car.getClient().getId());
        return response;
    }
}