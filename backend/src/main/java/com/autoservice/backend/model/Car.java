package com.autoservice.backend.model;
 
import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.UUID;
 
@Entity
@Table(name = "cars")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Car {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clientId", nullable = false)
    private Client client;
 
    @Column(nullable = false, unique = true, length = 20)
    private String licensePlate;
 
    @Column(nullable = false, length = 50)
    private String make;
 
    @Column(nullable = false, length = 50)
    private String model;
 
    @Column(nullable = false)
    private int year;
 
    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments;
}