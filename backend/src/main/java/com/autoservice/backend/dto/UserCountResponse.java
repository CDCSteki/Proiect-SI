package com.autoservice.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserCountResponse {
    private Long clients;
    private Long mechanics;
    private Long managers;
    private Long admins;
}