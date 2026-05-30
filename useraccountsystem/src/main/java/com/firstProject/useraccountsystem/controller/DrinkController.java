package com.firstProject.useraccountsystem.controller;

import com.firstProject.useraccountsystem.entity.Drink;
import com.firstProject.useraccountsystem.service.DrinkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class DrinkController {

    private final DrinkService drinkService;

    public DrinkController(DrinkService drinkService) {
        this.drinkService = drinkService;
    }

    // ============================
    // 前台使用：只取得上架飲料
    // GET /auth/drinks
    // ============================
    @GetMapping("/auth/drinks")
    public ResponseEntity<List<Drink>> getActiveDrinks() {
        return ResponseEntity.ok(drinkService.getActiveDrinks());
    }

    // ============================
    // 前台使用：取得單一上架飲料
    // GET /auth/drinks/{id}
    // ============================
    @GetMapping("/auth/drinks/{id}")
    public ResponseEntity<Drink> getById(@PathVariable Integer id) {
        return drinkService.getDrinkById(id)
                .filter(drink -> Boolean.TRUE.equals(drink.getActive()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ============================
    // Admin 使用：取得全部飲料
    // GET /admin/drinks
    // ============================
    @GetMapping("/admin/drinks")
    public ResponseEntity<List<Drink>> getAllDrinksForAdmin() {
        return ResponseEntity.ok(drinkService.getAllDrinks());
    }

    // ============================
    // Admin 使用：新增飲料
    // POST /admin/drinks
    // ============================
    @PostMapping("/admin/drinks")
    public ResponseEntity<Drink> create(@RequestBody Drink drink) {
        Drink saved = drinkService.createDrink(drink);
        return ResponseEntity.ok(saved);
    }

    // ============================
    // Admin 使用：更新飲料
    // PUT /admin/drinks/{id}
    // ============================
    @PutMapping("/admin/drinks/{id}")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestBody Drink drink) {

        return drinkService.updateDrink(id, drink)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ============================
    // Admin 使用：刪除飲料
    // DELETE /admin/drinks/{id}
    // ============================
    @DeleteMapping("/admin/drinks/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        drinkService.deleteDrink(id);
        return ResponseEntity.ok().build();
    }
}