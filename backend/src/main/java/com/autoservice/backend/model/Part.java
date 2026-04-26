package com.autoservice.backend.model;
 
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;
 
@Entity
@Table(name = "parts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Part {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repairRecordId", nullable = false)
    private RepairRecord repairRecord;
 
    @Column(nullable = false, length = 150)
    private String name;
 
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
 
    @Column(nullable = false)
    private int quantity;
}