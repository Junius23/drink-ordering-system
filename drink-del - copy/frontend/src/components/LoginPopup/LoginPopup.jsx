import React, { useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import UserService from "../UserService/UserService";

const LoginPopup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("Login"); // Login / Sign Up
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (currState === "Login") {
        // 🔹登入流程
        const userData = await UserService.login(
          formData.email,
          formData.password
        );

        if (userData.token) {
          localStorage.setItem("token", userData.token);
          localStorage.setItem("role", userData.role);
          setShowLogin(false);
          navigate("/profile");
        } else {
          setError(userData.message || "Login failed");
        }
      } else {
        // 🔹註冊流程：建立帳號（預設 USER），再自動登入
        const token = localStorage.getItem("token"); // 如果 /auth/register permitAll，可以傳 null
        const res = await UserService.register(
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: "USER",
          },
          token
        );

        if (res.statusCode === 200) {
          // 註冊成功後自動登入
          const userData = await UserService.login(
            formData.email,
            formData.password
          );
          localStorage.setItem("token", userData.token);
          localStorage.setItem("role", userData.role);
          alert(res.message || "Account created & logged in!");
          setShowLogin(false);
          navigate("/profile");
        } else {
          setError(res.message || res.error || "Register failed");
        }
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-popup">
      <form className="login-popup-container" onSubmit={handleSubmit}>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>

        {/* 錯誤訊息 */}
        {error && <p className="error-message">{error}</p>}

        <div className="login-popup-inputs">
          {currState === "Login" ? null : (
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="your email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : currState === "Sign Up"
            ? "Create account"
            : "Login"}
        </button>

        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>
            By continuing, I agree to the terms of use &amp; privacy policy.
          </p>
        </div>

        {currState === "Login" ? (
          <p>
            Create a new account?
            <span onClick={() => setCurrState("Sign Up")}> Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?
            <span onClick={() => setCurrState("Login")}> Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;

