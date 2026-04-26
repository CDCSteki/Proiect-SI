package com.autoservice.backend.model;
 
import jakarta.persistence.*;
import lombok.*;
import java.util.List;
 
@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Client extends User {
 
    @Column(length = 20)
    private String phoneNumber;
 
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Car> cars;
 
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Appointment> appointments;
}