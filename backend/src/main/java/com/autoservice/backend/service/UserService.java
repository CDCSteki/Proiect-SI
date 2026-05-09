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
        // Delete from current role table
        switch (currentRole) {
            case "CLIENT" -> clientRepository.deleteById(userId);
            case "MECHANIC" -> mechanicRepository.deleteById(userId);
            case "MANAGER" -> managerRepository.deleteById(userId);
            case "ADMIN" -> adminRepository.deleteById(userId);
        }

        // Create in new role table
        switch (newRole) {
            case "CLIENT" -> {
                Client client = new Client();
                copyBaseFields(user, client);
                clientRepository.save(client);
            }
            case "MECHANIC" -> {
                Mechanic mechanic = new Mechanic();
                copyBaseFields(user, mechanic);
                mechanicRepository.save(mechanic);
            }
            case "MANAGER" -> {
                Manager manager = new Manager();
                copyBaseFields(user, manager);
                managerRepository.save(manager);
            }
            case "ADMIN" -> {
                Admin admin = new Admin();
                copyBaseFields(user, admin);
                admin.setAccessLevel(1);
                adminRepository.save(admin);
            }
        }

        User updated = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToResponse(updated);
    }

    private void copyBaseFields(User source, User target) {
        target.setId(source.getId());
        target.setFirstName(source.getFirstName());
        target.setLastName(source.getLastName());
        target.setEmail(source.getEmail());
        target.setPasswordHash(source.getPasswordHash());
        target.setActive(source.isActive());
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getClass().getSimpleName().toUpperCase())
                .isActive(user.isActive())
                .build();
    }
}