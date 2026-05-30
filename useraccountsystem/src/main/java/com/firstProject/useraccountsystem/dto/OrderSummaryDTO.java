package com.firstProject.useraccountsystem.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderSummaryDTO {

    private Long id;
    private String userEmail;
    private String userName;
    private Integer total;
    private String paymentMethod;
    private String status;
    private LocalDateTime createdAt;

    private List<OrderItemDTO> items;

}
