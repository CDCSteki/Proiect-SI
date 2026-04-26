package com.autoservice.backend.model;
 
import jakarta.persistence.*;
import lombok.*;
 
@Entity
@Table(name = "admins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Admin extends User {
 
    @Column(nullable = false)
    private int accessLevel;
}