package com.firstProject.useraccountsystem.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/admin/upload")
public class ImageUploadController {

    // 用絕對路徑：專案根目錄底下的 uploads/drinks
    private static final Path UPLOAD_DIR =
            Paths.get("uploads", "drinks").toAbsolutePath().normalize();

    @PostMapping("/drink-image")
    public ResponseEntity<?> uploadDrinkImage(@RequestParam("file") MultipartFile file) {

        try {
            // 1. 確保目錄存在
            if (!Files.exists(UPLOAD_DIR)) {
                Files.createDirectories(UPLOAD_DIR);
            }

            // 2. 產生新檔名
            String originalName = file.getOriginalFilename();
            String ext = "";
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID() + ext;

            // 3. 實際檔案路徑（絕對路徑）
            Path targetPath = UPLOAD_DIR.resolve(fileName);
            File dest = targetPath.toFile();

            // 4. 寫入檔案
            file.transferTo(dest);

            // 取得電腦本機 IP（非 localhost）
            String ip = InetAddress.getLocalHost().getHostAddress();

            // 5. 回傳給前端使用的 URL（注意：是 URL，不是實體路徑）
            String url = "http://localhost:2020/uploads/drinks/" + fileName;
            //String url1 = "http://10.49.100.179/uploads/drinks/" + fileName;
            //String url2 = "http://" + ip + ":2020/uploads/" + fileName;

            System.out.println("圖片已儲存到：" + targetPath);  // debug 用
            return ResponseEntity.ok(url);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("圖片上傳失敗：" + e.getMessage());
        }
    }
}
