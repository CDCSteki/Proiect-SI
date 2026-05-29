package com.autoservice.backend.service;

import com.autoservice.backend.dto.ChangeRoleRequest;
import com.autoservice.backend.dto.UserResponse;
import com.autoservice.backend.exception.ConflictException;
import com.autoservice.backend.exception.ResourceNotFoundException;
import com.autoservice.backend.model.*;
import com.autoservice.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final MechanicRepository mechanicRepository;
    private final ManagerRepository managerRepository;
    private final AdminRepository adminRepository;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse toggleActive(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse changeRole(UUID userId, ChangeRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String newRole = request.getRole().toUpperCase();
        String currentRole = user.getClass().getSimpleName().toUpperCase();

        if (currentRole.equals(newRole)) {
            return mapToResponse(user);
        }

        // Verifici relatiile
        if (currentRole.equals("CLIENT")) {
            Client client = (Client) user;
            if (client.getCars() != null && !client.getCars().isEmpty()) {
                throw new ConflictException("Cannot change role: client has cars registered.");
            }
            if (client.getAppointments() != null && !client.getAppointments().isEmpty()) {
                throw new ConflictException("Cannot change role: client has appointments.");
            }
        }

        if (currentRole.equals("MECHANIC")) {
            Mechanic mechanic = (Mechanic) user;
            if (mechanic.getAppointments() != null && !mechanic.getAppointments().isEmpty()) {
                throw new ConflictException("Cannot change role: mechanic has appointments assigned.");
            }
        }

        // Delete din tabelul vechi cu SQL nativ
        switch (currentRole) {
            case "CLIENT" -> clientRepository.deleteByIdNative(userId);
            case "MECHANIC" -> mechanicRepository.deleteByIdNative(userId);
            case "MANAGER" -> managerRepository.deleteByIdNative(userId);
            case "ADMIN" -> adminRepository.deleteByIdNative(userId);
        }

        // Insert in tabelul nou cu SQL nativ
        switch (newRole) {
            case "CLIENT" -> clientRepository.insertNative(userId);
            case "MECHANIC" -> mechanicRepository.insertNative(
                    userId,
                    request.getSpecialization() != null ? request.getSpecialization() : "General",
                    request.getHourlyRate() != null ? request.getHourlyRate() : 0.0);
            case "MANAGER" -> managerRepository.insertNative(
                    userId,
                    request.getDepartment() != null ? request.getDepartment() : "General");
            case "ADMIN" -> adminRepository.insertNative(
                    userId,
                    request.getAccessLevel() != null ? request.getAccessLevel() : 1);
        }

        User updated = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UserResponse response = mapToResponse(updated);
        response.setRole(newRole);
        return response;
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getClass().getSimpleName().toUpperCase())
                .isActive(user.isActive())
                .build();
    }
}