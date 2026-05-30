package com.firstProject.useraccountsystem.service;

import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class LedService {

    //Led Service
    public String sendLedCommand(String espIp, String state) {
        try {
            String url = "http://" + espIp + "/setLed?state=" + state;

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .GET()
                    .uri(URI.create(url))
                    .build();

            client.send(request, HttpResponse.BodyHandlers.ofString());
            return "OK";

        } catch (Exception e) {
            return "FAIL: " + e.getMessage();
        }
    }

    //Dht Service
    public String readSensor(String espIp) {
        try {
            String url = "http://" + espIp + "/getSensor";

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .GET()
                    .uri(URI.create(url))
                    .build();

            HttpResponse<String> response =
                    client.send(request, HttpResponse.BodyHandlers.ofString());

            return response.body();

        } catch (Exception e) {
            return "{\"error\":\"" + e.getMessage() + "\"}";
        }
    }

}
