import React from "react";
import "./Header.css";
import headerImg from "../../assets/header_img01.png";

const Header = () => {
  return (
    <div className="header">
      <div className="header-left">
        <span className="header-badge">Refreshing Drinks</span>

        <h1>
          Order your
          <br />
          favorite drink
          <br />
          here
        </h1>

        <p>
          Choose from a diverse menu featuring a refreshing array of beverages
          crafted with the finest ingredients and mixology expertise. Our mission
          is to quench your thirst and elevate your drinking experience, one
          delightful sip at a time.
        </p>

        <div className="header-buttons">
          <button className="primary-btn">View Menu</button>
          <button className="secondary-btn">Learn More</button>
        </div>
      </div>

      <div className="header-right">
        <div className="image-card">
          <img src={headerImg} alt="Drink" className="header-img" />
        </div>
      </div>
    </div>
  );
};

export default Header;