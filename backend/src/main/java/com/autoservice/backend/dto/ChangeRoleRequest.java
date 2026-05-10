package com.autoservice.backend.dto;

import lombok.Data;

@Data
public class ChangeRoleRequest {
    private String role;
    private String specialization;   // pentru MECHANIC
    private Double hourlyRate;        // pentru MECHANIC
    private String department;        // pentru MANAGER
    private Integer accessLevel;      // pentru ADMIN
}