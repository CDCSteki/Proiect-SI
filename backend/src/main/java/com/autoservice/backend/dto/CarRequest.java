package com.autoservice.backend.dto;

import lombok.Data;

@Data
public class CarRequest {
    private String licensePlate;
    private String make;
    private String model;
    private int year;
}