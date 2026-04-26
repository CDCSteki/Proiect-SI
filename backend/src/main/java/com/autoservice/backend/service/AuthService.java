package com.autoservice.backend.service;

import com.autoservice.backend.model.Client;
import com.autoservice.backend.repository.UserRepository;
import com.autoservice.backend.repository.ClientRepository;
import com.autoservice.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Map<String, Object> register(String firstName, String lastName,
                                        String email, String password, String phone) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use.");
        }

        Client client = new Client();
        client.setFirstName(firstName);
        client.setLastName(lastName);
        client.setEmail(email);
        client.setPasswordHash(passwordEncoder.encode(password));
        client.setPhoneNumber(phone);
        client.setActive(true);

        clientRepository.save(client);

        String token = jwtUtil.generateToken(client.getId(), "CLIENT");

        return Map.of(
                "token", token,
                "user", Map.of(
                        "id", client.getId(),
                        "firstName", client.getFirstName(),
                        "lastName", client.getLastName(),
                        "email", client.getEmail(),
                        "role", "CLIENT"
                )
        );
    }

    public Map<String, Object> login(String email, String password) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password.");
        }

        String role = user.getClass().getSimpleName().toUpperCase();
        String token = jwtUtil.generateToken(user.getId(), role);

        return Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "firstName", user.getFirstName(),
                        "lastName", user.getLastName(),
                        "email", user.getEmail(),
                        "role", role
                )
        );
    }
}