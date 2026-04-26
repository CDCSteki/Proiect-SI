package com.autoservice.backend.model;
 
import jakarta.persistence.*;
import lombok.*;
 
@Entity
@Table(name = "managers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Manager extends User {
 
    @Column(length = 100)
    private String department;
}