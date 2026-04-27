package com.autoservice.backend.service;

import com.autoservice.backend.dto.AuthResponse;
import com.autoservice.backend.dto.LoginRequest;
import com.autoservice.backend.dto.RegisterRequest;
import com.autoservice.backend.model.Client;
import com.autoservice.backend.model.User;
import com.autoservice.backend.repository.ClientRepository;
import com.autoservice.backend.repository.UserRepository;
import com.autoservice.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse registerClient(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        Client client = new Client();
        client.setFirstName(request.getFirstName());
        client.setLastName(request.getLastName());
        client.setEmail(request.getEmail());
        client.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        client.setPhoneNumber(request.getPhoneNumber());
        
        clientRepository.save(client);
        
        String token = jwtUtil.generateToken(client, "CLIENT");
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        String role = user.getClass().getSimpleName().toUpperCase();
        String token = jwtUtil.generateToken(user, role);
        
        return new AuthResponse(token);
    }
}