import React, { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import UserService from "../UserService/UserService";


const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();

  // 是否登入：直接從 UserService / localStorage 判斷
  const isLoggedIn = UserService.isAuthenticated();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    UserService.logout();
    navigate("/"); // 登出後回到首頁
  };

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo01} alt="" className="logo01" />
      </Link>

      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => setMenu("menu")}
          className={menu === "menu" ? "active" : ""}
        >
          menu
        </a>
        <a
          href="#app-download"
          onClick={() => setMenu("mobile-app")}
          className={menu === "mobile-app" ? "active" : ""}
        >
          mobile-app
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("contact-us")}
          className={menu === "contact-us" ? "active" : ""}
        >
          contact us
        </a>
      </ul>

      <div className="navbar-right">
        <img src={assets.search_icon} alt="" />

        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
          </Link>
          {getTotalCartAmount() > 0 && <div className="dot"></div>}
        </div>

        {/* ⭐ 這裡依登入狀態切換 UI */}
        {isLoggedIn ? (
          <div className="navbar-auth">
            <Link to="/profile" className="navbar-profile-link">
              <img src={assets.profile_icon} alt="" />
            </Link>
            <button className="navbar-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)}>Sign in</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
