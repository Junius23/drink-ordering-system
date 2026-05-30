package com.firstProject.useraccountsystem.repository;

import com.firstProject.useraccountsystem.entity.Drink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DrinkRepo extends JpaRepository<Drink, Integer> {

    // 前台只取得上架飲料
    List<Drink> findByActiveTrue();

}