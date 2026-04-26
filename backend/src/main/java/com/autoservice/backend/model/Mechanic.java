package com.autoservice.backend.model;
 
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
 
@Entity
@Table(name = "mechanics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Mechanic extends User {
 
    @Column(length = 100)
    private String specialization;
 
    @Column(precision = 10, scale = 2)
    private BigDecimal hourlyRate;
 
    @OneToMany(mappedBy = "mechanic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments;
}