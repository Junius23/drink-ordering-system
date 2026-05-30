package com.firstProject.useraccountsystem.controller;

import com.firstProject.useraccountsystem.dto.RegRes;
import com.firstProject.useraccountsystem.entity.OurUsers;
import com.firstProject.useraccountsystem.service.UserAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserAccountController {

    @Autowired
    private UserAccountService userAccountService; // 注入 Service，處理真正的業務邏輯

    // 使用者註冊
    @PostMapping("/auth/register")
    public ResponseEntity<RegRes> register(@RequestBody RegRes reg) {
        return ResponseEntity.ok(userAccountService.register(reg));
    }

    // 使用者登入
    @PostMapping("/auth/login")
    public ResponseEntity<RegRes> login(@RequestBody RegRes reg) {
        return ResponseEntity.ok(userAccountService.login(reg));
    }

    // 使用 refresh token 換取新的 token
    @PostMapping("/auth/refresh")
    public ResponseEntity<RegRes> refreshToken(@RequestBody RegRes reg) {
        return ResponseEntity.ok(userAccountService.refreshToken(reg));
    }

    // 管理員取得所有使用者列表
    @GetMapping("/admin/get-all-users")
    public ResponseEntity<RegRes> getAllUsers() {
        return ResponseEntity.ok(userAccountService.getAllUsers());
    }

    // 管理員根據 userId 查詢特定使用者資料
    @GetMapping("/admin/get-users/{userId}")
    public ResponseEntity<RegRes> getUserByID(@PathVariable Integer userId) {
        return ResponseEntity.ok(userAccountService.getUserById(userId));
    }

    // 管理員更新指定使用者資料
    @PutMapping("/admin/update/{userId}")
    public ResponseEntity<RegRes> updateUser(@PathVariable Integer userId, @RequestBody OurUsers regres) {
        return ResponseEntity.ok(userAccountService.updateUser(userId, regres));
    }

    // 取得目前登入者自己的個人資料（根據 token）
    @GetMapping("/adminuser/get-profile")
    public ResponseEntity<RegRes> getMyProfile() {
        // 從 Spring Security 取得目前登入者的 email
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // 用 email 查使用者資料
        RegRes response = userAccountService.getMyInfo(email);

        // 用回傳的 statusCode 作為 HTTP 回應碼
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    // 管理員刪除使用者
    @DeleteMapping("/admin/delete/{userId}")
    public ResponseEntity<RegRes> deleteUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(userAccountService.deleteUser(userId));
    }
}
