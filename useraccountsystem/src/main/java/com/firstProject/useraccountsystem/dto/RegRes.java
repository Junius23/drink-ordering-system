package com.firstProject.useraccountsystem.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.firstProject.useraccountsystem.entity.OurUsers;
import lombok.Data;

import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class RegRes {

    private int statusCode;
    private String error;
    private String message;

    private String token;
    private String refreshToken;
    private String expirationTime;

    private String email;
    private String name;
    private String password;
    private String role;

    private OurUsers ourUsers;
    private List<OurUsers> ourUsersList;
}
