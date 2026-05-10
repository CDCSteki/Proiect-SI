package com.autoservice.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class AvailableMechanicResponse {
    private UUID mechanicId;
    private String firstName;
    private String lastName;
    private String specialization;
}