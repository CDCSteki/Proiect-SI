package com.autoservice.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clientId", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanicId")
    private Mechanic mechanic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carId", nullable = false)
    private Car car;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private RepairRecord repairRecord;

    public enum AppointmentStatus {
        SCHEDULED,
        IN_PROGRESS,
        DONE,
        READY_FOR_PICKUP,
        CANCELLED
    }
}