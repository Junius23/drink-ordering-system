import React, { useContext } from "react";
import "./DrinkItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";
import BASE_URL from "../../cors/config";

const DrinkItem = ({ id, name, price, description, image, soldOut }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);

  const itemId = String(id);
  const quantity = cartItems[itemId] || cartItems[id] || 0;

  const isSoldOut =
    soldOut === true ||
    soldOut === 1 ||
    soldOut === "1" ||
    soldOut === "0x01";

  const getImageSrc = () => {
    if (!image) {
      return assets.logo01;
    }

    if (typeof image !== "string") {
      return assets.logo01;
    }

    if (image.startsWith("http")) {
      return image;
    }

    if (image.startsWith("/uploads")) {
      return `${BASE_URL}${image}`;
    }

    return image;
  };

  return (
    <div className={`drink-item ${isSoldOut ? "sold-out-item" : ""}`}>
      <div className="drink-item-img-container">
        <img
          className="drink-item-image"
          src={getImageSrc()}
          alt={name}
          onError={(e) => {
            e.currentTarget.src = assets.logo01;
          }}
        />

        {isSoldOut ? (
          <div className="sold-out-label">售完</div>
        ) : quantity === 0 ? (
          <img
            className="add"
            onClick={() => addToCart(itemId)}
            src={assets.add_icon_white}
            alt="add"
          />
        ) : (
          <div className="drink-item-counter">
            <img
              onClick={() => removeFromCart(itemId)}
              src={assets.remove_icon_red}
              alt="remove"
            />

            <p>{quantity}</p>

            <img
              onClick={() => addToCart(itemId)}
              src={assets.add_icon_green}
              alt="add"
            />
          </div>
        )}
      </div>

      <div className="drink-item-info">
        <div className="drink-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts_1} alt="rating" />
        </div>

        <p className="drink-item-description">
          {description || "No description"}
        </p>

        <p className="drink-item-price">NTD{price}</p>
      </div>
    </div>
  );
};

export default DrinkItem;