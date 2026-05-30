package com.firstProject.useraccountsystem.repository;

import com.firstProject.useraccountsystem.entity.Order;
import com.firstProject.useraccountsystem.entity.OurUsers;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepo extends JpaRepository<Order, Long> {

    List<Order> findByUser(OurUsers user);

    List<Order> findByUserId(Integer userId);

    List<Order> findByStatus(String status);

    List<Order> findByUserIdAndStatus(Integer userId, String status);

    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Order> findByPaymentMethod(String paymentMethod);


}


