package com.firstProject.useraccountsystem.service;

import com.firstProject.useraccountsystem.entity.Drink;
import com.firstProject.useraccountsystem.repository.DrinkRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DrinkService {

    private final DrinkRepo drinkRepo;

    public DrinkService(DrinkRepo drinkRepo) {
        this.drinkRepo = drinkRepo;
    }

    // Admin 使用：取得全部飲料，包含上架、下架、售完
    public List<Drink> getAllDrinks() {
        return drinkRepo.findAll();
    }

    // 前台使用：只取得上架飲料
    public List<Drink> getActiveDrinks() {
        return drinkRepo.findByActiveTrue();
    }

    // 依照 ID 取得單一飲料
    public Optional<Drink> getDrinkById(Integer id) {
        return drinkRepo.findById(id);
    }

    // 新增飲料
    public Drink createDrink(Drink drink) {
        if (drink.getActive() == null) {
            drink.setActive(true);
        }

        if (drink.getSoldOut() == null) {
            drink.setSoldOut(false);
        }

        return drinkRepo.save(drink);
    }

    // 更新飲料
    public Optional<Drink> updateDrink(Integer id, Drink updated) {
        return drinkRepo.findById(id).map(drink -> {
            drink.setName(updated.getName());
            drink.setPrice(updated.getPrice());
            drink.setDescription(updated.getDescription());
            drink.setImageUrl(updated.getImageUrl());
            drink.setCategory(updated.getCategory());

            if (updated.getActive() != null) {
                drink.setActive(updated.getActive());
            }

            if (updated.getSoldOut() != null) {
                drink.setSoldOut(updated.getSoldOut());
            }

            return drinkRepo.save(drink);
        });
    }

    // 刪除飲料
    public void deleteDrink(Integer id) {
        drinkRepo.deleteById(id);
    }
}