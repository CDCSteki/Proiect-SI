package com.autoservice.backend.model;
 
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
 
@Entity
@Table(name = "repair_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RepairRecord {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;
 
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointmentId", nullable = false, unique = true)
    private Appointment appointment;
 
    @Column(length = 500)
    private String diagnosis;
 
    @Column(precision = 10, scale = 2)
    private BigDecimal laborHours;
 
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost = BigDecimal.ZERO;
 
    @OneToMany(mappedBy = "repairRecord", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Part> parts;
 
    @OneToOne(mappedBy = "repairRecord", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Invoice invoice;
}