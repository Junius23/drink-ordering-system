import React, { useState } from "react";
import UserService from "../service/UserService";
import { useNavigate } from "react-router-dom";

function RegistrationPage() {
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN", // 預設 USER
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token"); // 如果 /auth/register 已經 permitAll，其實可以不傳
      const res = await UserService.register(formData, token);

      // 後端 RegRes 的格式：statusCode / message / error / ourUsers ...
      if (res.statusCode === 200) {
        alert(res.message || "User registered successfully");

        // 清空表單
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "ADMIN",
        });
        if (res.statusCode === 200) {

            // 註冊成功後 → 自動登入
            const loginRes = await UserService.login(formData.email, formData.password);

            localStorage.setItem("token", loginRes.token);
            localStorage.setItem("role", loginRes.role);

            alert("Account created & logged in!");
            navigate("/profile");
        }

      } else {
        // 顯示後端給的錯誤訊息
        alert(res.message || res.error || "Register failed");
      }
    } catch (error) {
      console.error("Error registering user:", error);

      if (error.response && error.response.data) {
        const data = error.response.data;
        alert(data.message || data.error || "Register failed");
      } else {
        alert(error.message || "Network error");
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Registration</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Role:</label>
          {/* 用 select 避免輸入錯誤導致 Invalid role */}
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
          >
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegistrationPage;
