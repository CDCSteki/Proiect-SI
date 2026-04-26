package com.autoservice.backend.model;
 
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;
 
@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;
 
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repairRecordId", nullable = false, unique = true)
    private RepairRecord repairRecord;
 
    @Column(nullable = false, unique = true, length = 30)
    private String invoiceNumber;
 
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;
 
    @Column(nullable = false)
    private boolean isPaid = false;
}