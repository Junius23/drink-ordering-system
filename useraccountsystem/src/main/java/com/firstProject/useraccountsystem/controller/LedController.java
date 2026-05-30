package com.firstProject.useraccountsystem.controller;

import com.firstProject.useraccountsystem.dto.LedDTO;
import com.firstProject.useraccountsystem.service.LedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/iot")
public class LedController {

    private final String ESP32_IP = "192.168.0.105";  // ★ 用你的 IP

    @Autowired
    private LedService ledService;

    @PostMapping("/led")
    public String controlLed(@RequestBody LedDTO req) {
        return ledService.sendLedCommand(ESP32_IP, req.getState());
    }

    @GetMapping("/sensor")
    public String getSensor() {
        return ledService.readSensor(ESP32_IP);
    }

}

