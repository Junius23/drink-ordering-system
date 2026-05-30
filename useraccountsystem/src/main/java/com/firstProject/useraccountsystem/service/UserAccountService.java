package com.firstProject.useraccountsystem.service;

import com.firstProject.useraccountsystem.dto.RegRes;
import com.firstProject.useraccountsystem.entity.OurUsers;
import com.firstProject.useraccountsystem.repository.UsersRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
public class UserAccountService {

    @Autowired
    private UsersRepo usersRepo;

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public RegRes register(RegRes registrationRequest) {
        RegRes resp = new RegRes();

        try {
            if (registrationRequest.getEmail() == null || registrationRequest.getEmail().isEmpty()) {
                resp.setStatusCode(400);
                resp.setMessage("Email cannot be empty");
                return resp;
            }

            if (!registrationRequest.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                resp.setStatusCode(400);
                resp.setMessage("Invalid email format");
                return resp;
            }

            if (usersRepo.findByEmail(registrationRequest.getEmail()).isPresent()) {
                resp.setStatusCode(400);
                resp.setMessage("Email already exists");
                return resp;
            }

            if (registrationRequest.getPassword() == null || registrationRequest.getPassword().length() < 6) {
                resp.setStatusCode(400);
                resp.setMessage("Password must be at least 6 characters");
                return resp;
            }

            if (registrationRequest.getName() == null || registrationRequest.getName().isBlank()) {
                resp.setStatusCode(400);
                resp.setMessage("Name cannot be empty");
                return resp;
            }

            if (registrationRequest.getRole() == null ||
                    !(registrationRequest.getRole().equals("USER") ||
                            registrationRequest.getRole().equals("ADMIN"))) {

                resp.setStatusCode(400);
                resp.setMessage("Invalid role");
                return resp;
            }

            OurUsers ourUsers = new OurUsers();
            ourUsers.setEmail(registrationRequest.getEmail());
            ourUsers.setName(registrationRequest.getName());
            ourUsers.setRole(registrationRequest.getRole());
            ourUsers.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));

            OurUsers ourUsersResult = usersRepo.save(ourUsers);

            if (ourUsersResult.getId() > 0) {
                resp.setOurUsers(ourUsersResult);
                resp.setMessage("User Saved Successfully");
                resp.setStatusCode(200);
            }

        } catch (Exception e) {
            resp.setStatusCode(500);
            resp.setError(e.getMessage());
        }

        return resp;
    }

    public RegRes login(RegRes loginRequest) {
        RegRes response = new RegRes();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()

                    )
            );

            var user = usersRepo.findByEmail(loginRequest.getEmail()).orElseThrow();

            var jwt = jwtUtils.generateToken(user);
            var refreshToken = jwtUtils.generateRefreshToken(new HashMap<>(), user);

            response.setStatusCode(200);
            response.setToken(jwt);
            response.setRole(user.getRole());
            response.setRefreshToken(refreshToken);
            response.setExpirationTime("24Hrs");
            response.setMessage("User Logged In Successfully");

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setError(e.getMessage());
        }
        return response;
    }

    public RegRes refreshToken(RegRes refreshTokenRequest) {
        RegRes response = new RegRes();
        try {
            // 用 refreshToken 取出 email
            String email = jwtUtils.extractUserName(refreshTokenRequest.getRefreshToken());

            OurUsers user = usersRepo.findByEmail(email).orElseThrow();

            // 驗證 refreshToken 是否有效
            if (jwtUtils.isTokenValid(refreshTokenRequest.getRefreshToken(), user)) {

                // 產生新的 access token
                String newAccessToken = jwtUtils.generateToken(user);

                response.setStatusCode(200);
                response.setToken(newAccessToken);
                response.setRole(user.getRole());
                response.setRefreshToken(refreshTokenRequest.getRefreshToken()); // refreshToken 照舊
                response.setExpirationTime("24Hrs"); // 或改成 "10Days" 比較符合實際
                response.setMessage("Successfully Refreshed Token");
            } else {
                response.setStatusCode(401);
                response.setMessage("Invalid refresh token");
            }

        } catch (Exception e) {
            response.setStatusCode(500);
            response.setMessage("Error while refreshing token: " + e.getMessage());
        }
        return response;
    }


    public RegRes getAllUsers() {
        RegRes regRes = new RegRes();

        try {
            List<OurUsers> result = usersRepo.findAll();

            if (!result.isEmpty()) {
                regRes.setOurUsersList(result);
                regRes.setStatusCode(200);
                regRes.setMessage("Successfully");
            } else {
                regRes.setStatusCode(404);
                regRes.setMessage("No users found");
            }

        } catch (Exception e) {
            regRes.setStatusCode(500);
            regRes.setMessage("Error occurred:" + e.getMessage());
        }
        return regRes;
    }

    public RegRes getUserById(Integer id) {
        RegRes regRes = new RegRes();

        try {
            OurUsers userById = usersRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            regRes.setOurUsers(userById);
            regRes.setStatusCode(200);
            regRes.setMessage("Users with id '" + id + "' found Successfully");

        } catch (Exception e) {
            regRes.setStatusCode(500);
            regRes.setMessage("Error occurred:" + e.getMessage());
        }
        return regRes;
    }

    public RegRes deleteUser(Integer userId) {
        RegRes regRes = new RegRes();

        try {
            Optional<OurUsers> userOptional = usersRepo.findById(userId);

            if (userOptional.isPresent()) {
                usersRepo.deleteById(userId);
                regRes.setStatusCode(200);
                regRes.setMessage("User deleted Successfully");
            } else {
                regRes.setStatusCode(404);
                regRes.setMessage("User no found for deletion");
            }

        } catch (Exception e) {
            regRes.setStatusCode(500);
            regRes.setMessage("Error occurred while deleting user:" + e.getMessage());
        }
        return regRes;
    }

    public RegRes updateUser(Integer userId, OurUsers updateUser) {
        RegRes regRes = new RegRes();

        try {
            Optional<OurUsers> userOptional = usersRepo.findById(userId);

            if (userOptional.isPresent()) {
                OurUsers existingUser = userOptional.get();

                existingUser.setEmail(updateUser.getEmail());
                existingUser.setName(updateUser.getName());
                existingUser.setRole(updateUser.getRole());

                // 如果 password 有填，就加密並更新
                if (updateUser.getPassword() != null && !updateUser.getPassword().isEmpty()) {
                    existingUser.setPassword(passwordEncoder.encode(updateUser.getPassword()));
                }

                OurUsers savedUser = usersRepo.save(existingUser);

                regRes.setOurUsers(savedUser);
                regRes.setStatusCode(200);
                regRes.setMessage("User Updated Successfully");

            } else {
                regRes.setStatusCode(404);
                regRes.setMessage("User no found for deletion");
            }

        } catch (Exception e) {
            regRes.setStatusCode(500);
            regRes.setMessage("Error occurred while updating user:" + e.getMessage());
        }
        return regRes;
    }

    public RegRes getMyInfo(String email) {
        RegRes regRes = new RegRes();

        try {
            Optional<OurUsers> userOptional = usersRepo.findByEmail(email);

            if (userOptional.isPresent()) {
                regRes.setOurUsers(userOptional.get());
                regRes.setStatusCode(200);
                regRes.setMessage("Successfully");
            } else {
                regRes.setStatusCode(404);
                regRes.setMessage("User not found for update");
            }

        } catch (Exception e) {
            regRes.setStatusCode(500);
            regRes.setMessage("Error occurred while getting user info:" + e.getMessage());
        }
        return regRes;
    }
}
