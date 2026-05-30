package com.firstProject.useraccountsystem.service;

import com.firstProject.useraccountsystem.dto.OrderDTO;
import com.firstProject.useraccountsystem.dto.OrderItemDTO;
import com.firstProject.useraccountsystem.dto.OrderSummaryDTO;
import com.firstProject.useraccountsystem.entity.Order;
import com.firstProject.useraccountsystem.entity.OrderItem;
import com.firstProject.useraccountsystem.entity.OurUsers;
import com.firstProject.useraccountsystem.repository.OrderRepo;
import com.firstProject.useraccountsystem.repository.UsersRepo;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final UsersRepo usersRepo;
    private final OrderRepo orderRepo;

    public OrderService(UsersRepo usersRepo, OrderRepo orderRepo) {
        this.usersRepo = usersRepo;
        this.orderRepo = orderRepo;
    }

    // 建立訂單
    public Order createOrder(OrderDTO req, String userEmail) {

        OurUsers user = usersRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setSubtotal(req.getSubtotal());
        order.setDeliveryFee(req.getDeliveryFee());
        order.setTotal(req.getTotal());
        order.setStatus("PENDING");
        order.setPaymentMethod(req.getPaymentMethod());

        List<OrderItem> items = req.getItems().stream().map(i -> {
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setDrinkId(i.getDrinkId());
            oi.setName(i.getName());
            oi.setPrice(i.getPrice());
            oi.setQuantity(i.getQuantity());
            return oi;
        }).toList();

        order.setItems(items);

        return orderRepo.save(order);
    }

    // 後台取得全部訂單
    public List<OrderSummaryDTO> getAllOrdersForAdmin() {
        List<Order> orders = orderRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return orders.stream().map(this::toSummaryDto).toList();
    }

    // ⭐ 最重要：轉換成傳給前端的 DTO（包含 items）
    private OrderSummaryDTO toSummaryDto(Order order) {
        OrderSummaryDTO dto = new OrderSummaryDTO();

        dto.setId(order.getId());
        dto.setTotal(order.getTotal());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setStatus(order.getStatus());
        dto.setCreatedAt(order.getCreatedAt());

        if (order.getUser() != null) {
            dto.setUserEmail(order.getUser().getEmail());
            dto.setUserName(order.getUser().getName());
        }

        // ⭐⭐ 最重要：加入 Items 給前端
        dto.setItems(
                order.getItems().stream()
                        .map(i -> {
                            OrderItemDTO d = new OrderItemDTO();
                            d.setDrinkId(i.getDrinkId());
                            d.setName(i.getName());
                            d.setQuantity(i.getQuantity());
                            d.setPrice(i.getPrice());
                            return d;
                        })
                        .toList()
        );

        return dto;
    }

    // 刪除單筆訂單
    public void deleteOrderById(Long id) {
        if (!orderRepo.existsById(id)) {
            throw new RuntimeException("訂單不存在 id = " + id);
        }
        orderRepo.deleteById(id);
    }

    // 刪除所有已取消
    public int deleteAllCancelledOrders() {
        List<Order> cancelled = orderRepo.findByStatus("CANCELLED");
        int count = cancelled.size();
        if (count > 0) orderRepo.deleteAll(cancelled);
        return count;
    }

    // 更新訂單狀態（取消/完成）
    public boolean updateOrderStatus(Long id, String newStatus) {
        return orderRepo.findById(id)
                .map(order -> {
                    order.setStatus(newStatus);
                    orderRepo.save(order);
                    return true;
                })
                .orElse(false);
    }
}
