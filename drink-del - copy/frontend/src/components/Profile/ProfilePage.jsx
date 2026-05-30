import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";
import UserService from "../UserService/UserService";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 沒登入 → 回首頁
    if (!UserService.isAuthenticated()) {
      navigate("/");
      return;
    }

    const token = localStorage.getItem("token");

    UserService.getYourProfile(token)
      .then((res) => {
        // 後端資料可能包在 res.ourUsers 或 res.user
        const user = res.ourUsers || res.user || res;
        setProfile(user);
      })
      .catch(() => {
        UserService.logout();
        navigate("/");
      });
  }, [navigate]);

  const handleLogout = () => {
    UserService.logout();
    navigate("/");
  };

  if (!profile) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>Your Profile</h2>

        <div className="profile-info">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
