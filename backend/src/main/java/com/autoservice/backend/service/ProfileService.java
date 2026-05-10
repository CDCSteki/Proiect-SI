package com.autoservice.backend.service;

import com.autoservice.backend.dto.ChangePasswordRequest;
import com.autoservice.backend.dto.UpdateProfileRequest;
import com.autoservice.backend.dto.UserResponse;
import com.autoservice.backend.exception.BadRequestException;
import com.autoservice.backend.exception.ResourceNotFoundException;
import com.autoservice.backend.model.Client;
import com.autoservice.backend.model.User;
import com.autoservice.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToResponse(user);
    }

    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null && user instanceof Client client) {
            client.setPhoneNumber(request.getPhone());
        }

        userRepository.save(user);
        return mapToResponse(user);
    }

    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Old password is incorrect.");
        }

        if (request.getNewPassword().length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
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