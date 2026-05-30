import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserService from '../service/UserService';
import './Navbar.css';
import { assets } from '../../assets/assets';

function Navbar() {
    const [profileInfo, setProfileInfo] = useState({});
    const [menuOpen, setMenuOpen] = useState(false);

    const isAuthenticated = UserService.isAuthenticated();
    const isAdmin = UserService.isAdmin();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const handleLogout = () => {
        const confirmLogout = window.confirm('Are you sure you want to logout this user?');

        if (confirmLogout) {
            UserService.logout();
            navigate("/login");
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchProfileInfo();
        }
    }, [isAuthenticated]);

    const fetchProfileInfo = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return;
            }

            const response = await UserService.getYourProfile(token);
            setProfileInfo(response.ourUsers || {});
        } catch (error) {
            console.error('Error fetching profile information:', error);
        }
    };

    return (
        <nav>
            {/* 漢堡按鈕 */}
            <button className="menu-btn" onClick={toggleMenu}>
                ☰
            </button>

            <ul className={menuOpen ? "menu open" : "menu"}>
                {!isAuthenticated && (
                    <li>
                        <Link to="/register" onClick={closeMenu}>
                            Registration
                        </Link>
                    </li>
                )}

                {!isAuthenticated && (
                    <li>
                        <Link to="/" onClick={closeMenu}>
                            Login
                        </Link>
                    </li>
                )}

                {isAdmin && (
                    <li>
                        <Link to="/admin/orders" onClick={closeMenu}>
                            Order
                        </Link>
                    </li>
                )}

                {isAdmin && (
                    <li>
                        <Link to="/admin/order-report" onClick={closeMenu}>
                            Order Report
                        </Link>
                    </li>
                )}

                {isAdmin && (
                    <li>
                        <Link to="/admin/dashboard" onClick={closeMenu}>
                            DashBoard
                        </Link>
                    </li>
                )}

                {isAdmin && (
                    <li>
                        <Link to="/admin/drinks" onClick={closeMenu}>
                            Upload
                        </Link>
                    </li>
                )}

                {isAdmin && (
                    <li>
                        <Link to="/admin/led" onClick={closeMenu}>
                            LED Control
                        </Link>
                    </li>
                )}

                {isAdmin && (
                    <li>
                        <Link to="/admin/dht" onClick={closeMenu}>
                            DHT Control
                        </Link>
                    </li>
                )}
            </ul>

            {/* 使用者資訊區塊 */}
            {isAuthenticated && (
                <div className="user-box">
                    <Link to="/profile">
                        <img
                            src={assets.user}
                            alt="avatar"
                            className="avatar"
                        />
                    </Link>

                    <span className="username">
                        <p>{profileInfo.name}</p>
                    </span>

                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}

export default Navbar;