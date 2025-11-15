package com.swp391.bookverse.repository;

import com.swp391.bookverse.entity.User;
import com.swp391.bookverse.enums.Role;
import jakarta.validation.constraints.Email;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @Author huangdat
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);

    List<User> findByRolesContaining(String role);

    boolean existsByEmail(@Email(message = "EMAIL_INVALID") String email);

    // find user by email
    Optional<User> findByEmail(@Email(message = "EMAIL_INVALID") String email);

    // for notification handling
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r = :#{#role.name()}")
    List<User> findAllByRolesContaining(@Param("role") Role role);

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r IN :#{#roles.![name()]}")
    List<User> findAllByRolesContainingAny(@Param("roles") List<Role> roles);

}
