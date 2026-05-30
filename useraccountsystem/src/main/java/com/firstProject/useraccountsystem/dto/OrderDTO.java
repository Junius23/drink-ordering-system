package com.firstProject.useraccountsystem.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderDTO {

    private List<OrderItemDTO> items;
    private Integer subtotal;
    private Integer deliveryFee;
    private Integer total;
    private String paymentMethod;

}