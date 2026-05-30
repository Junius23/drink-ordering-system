package com.firstProject.useraccountsystem.controller;

import com.firstProject.useraccountsystem.dto.OrderSummaryDTO;
import com.firstProject.useraccountsystem.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // 取得所有訂單
    @GetMapping("/admin/orders")
    public ResponseEntity<List<OrderSummaryDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin());
    }

    // ✔ 完成訂單
    @PutMapping("/admin/orders/{id}/complete")
    public ResponseEntity<String> completeOrder(@PathVariable Long id) {
        boolean ok = orderService.updateOrderStatus(id, "COMPLETED");
        if (!ok) return ResponseEntity.badRequest().body("完成訂單失敗：訂單不存在");
        return ResponseEntity.ok("訂單已完成");
    }

    // ✔ 取消訂單
    @PutMapping("/admin/orders/{id}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Long id) {
        boolean ok = orderService.updateOrderStatus(id, "CANCELLED");
        if (!ok) return ResponseEntity.badRequest().body("取消訂單失敗：訂單不存在");
        return ResponseEntity.ok("訂單已取消");
    }

    // ✔ 刪除單筆
    @DeleteMapping("/admin/orders/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrderById(id);
        return ResponseEntity.noContent().build();
    }

    // ✔ 刪除全部取消訂單
    @DeleteMapping("/admin/orders/cancelled")
    public ResponseEntity<String> deleteAllCancelledOrders() {
        int deleted = orderService.deleteAllCancelledOrders();
        return ResponseEntity.ok("已刪除 " + deleted + " 筆已取消訂單");
    }
}
