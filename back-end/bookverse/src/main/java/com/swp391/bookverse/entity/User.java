package com.swp391.bookverse.entity;

import com.swp391.bookverse.converter.BooleanConverter;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

/**
 * @Author huangdat
 */

@Data
@Entity
@Table(name = "user")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String username;
    String password;
    String email;
    @Column(name = "fullname")
    String name;
    String phone;
    String address;
    String image;
    @Column(columnDefinition = "TINYINT(1)")
    @Convert(converter = BooleanConverter.class)
    boolean active;
    @ElementCollection
    @CollectionTable(name = "user_role", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    Set<String> roles;
}
