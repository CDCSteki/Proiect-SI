package com.autoservice.backend.controller;

import com.autoservice.backend.dto.ChangeRoleRequest;
import com.autoservice.backend.dto.UserResponse;
import com.autoservice.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> toggleActive(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.toggleActive(id));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> changeRole(
            @PathVariable UUID id,
            @RequestBody ChangeRoleRequest request
    ) {
        return ResponseEntity.ok(userService.changeRole(id, request));
    }
}