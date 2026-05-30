package com.firstProject.useraccountsystem.dto;

import lombok.Data;

@Data
public class OrderItemDTO {

    private String drinkId;
    private String name;
    private Integer price;
    private Integer quantity;

}
