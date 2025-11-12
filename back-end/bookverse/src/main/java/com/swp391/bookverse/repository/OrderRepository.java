package com.swp391.bookverse.repository;

import com.swp391.bookverse.entity.Order;
import com.swp391.bookverse.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.active = true ORDER BY o.createdAt DESC")
    List<Order> findByUserId(@Param("userId") String userId);

    @Query("SELECT o FROM Order o WHERE o.status = :status AND o.active = true ORDER BY o.createdAt DESC")
    List<Order> findByStatus(@Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.active = true ORDER BY o.createdAt DESC")
    List<Order> findAllActiveOrders();

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.book WHERE o.id = :id AND o.active = true")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

}
