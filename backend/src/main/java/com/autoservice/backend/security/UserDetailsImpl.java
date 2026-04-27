package com.autoservice.backend.security;

import com.autoservice.backend.model.User;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

@AllArgsConstructor
public class UserDetailsImpl implements UserDetails {
    private User user;
    private String role;

    public UUID getId() { 
        return user.getId(); 
    }

    @Override 
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override 
    public String getPassword() { 
        return user.getPasswordHash(); 
    }

    @Override 
    public String getUsername() { 
        return user.getEmail(); 
    }

    @Override 
    public boolean isAccountNonExpired() { 
        return true; 
    }

    @Override 
    public boolean isAccountNonLocked() { 
        return true; 
    }

    @Override 
    public boolean isCredentialsNonExpired() { 
        return true; 
    }

    @Override 
    public boolean isEnabled() { 
        return user.isActive(); 
    }
}