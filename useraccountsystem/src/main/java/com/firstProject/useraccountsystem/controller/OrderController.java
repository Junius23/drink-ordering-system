package com.firstProject.useraccountsystem.controller;

import com.firstProject.useraccountsystem.dto.OrderDTO;
import com.firstProject.useraccountsystem.entity.Order;
import com.firstProject.useraccountsystem.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // 使用者建立訂單
    @PostMapping("/order/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderDTO request,
                                         Authentication authentication) {

        // 1. 未登入
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of("message", "Unauthorized: please login first"));
        }

        try {
            // 2. 從 JWT 取得 email
            String email = authentication.getName();
            System.out.println("Create order for user: " + email);
            System.out.println("OrderRequest: " + request);

            // 3. 呼叫 service 建立訂單
            Order order = orderService.createOrder(request, email);

            return ResponseEntity.ok(order);

        } catch (Exception e) {
            e.printStackTrace(); // 後端 console 顯示錯誤

            return ResponseEntity
                    .status(500)
                    .body(Map.of(
                            "message", "Failed to create order",
                            "error", e.getMessage()
                    ));
        }
    }
}
