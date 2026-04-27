package com.autoservice.backend.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CarResponse {
    private UUID id;
    private String licensePlate;
    private String make;
    private String model;
    private int year;
    private UUID clientId;
}