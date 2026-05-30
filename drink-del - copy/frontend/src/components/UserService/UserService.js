import axios from "axios";
import BASE_URL from "../../cors/config";

class UserService {
  static async login(email, password) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });

      // 重要：登入成功後存 token / role
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);

      return response.data;
    } catch (err) {
      throw err;
    }
  }

  static async register(userData) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, userData);
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  static async getYourProfile() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${BASE_URL}/adminuser/get-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (err) {
      throw err;
    }
  }

  static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }

  static isAuthenticated() {
    const token = localStorage.getItem("token");
    return !!token;
  }

  static isAdmin() {
    const role = localStorage.getItem("role");
    return role === "ADMIN";
  }

  static isUser() {
    const role = localStorage.getItem("role");
    return role === "USER";
  }

  static adminOnly() {
    return this.isAuthenticated() && this.isAdmin();
  }
}

export default UserService;