package com.firstProject.useraccountsystem.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "drinks")
@Data
public class Drink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // 對應前端 item.name
    private String name;

    // 對應前端 item.price
    private Integer price;

    // 對應前端 item.description
    private String description;

    // 對應前端 item.imageUrl
    private String imageUrl;

    // 對應前端 item.category
    private String category;

    // 是否上架
    // false = 下架，前台不顯示
    private Boolean active = true;

    // 是否售完
    // true = 前台顯示售完，但不能加入購物車
    private Boolean soldOut = false;
}