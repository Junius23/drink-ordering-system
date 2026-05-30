import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../cors/config";

const Cart = () => {
  const { cartItems, drink_list, removeFromCart, getTotalCartAmount } =
    useContext(StoreContext);

  const navigate = useNavigate();

  const getImageSrc = (item) => {
    const img = item.imageUrl || item.image;

    if (!img) return "";

    // 如果後端回傳完整網址
    if (img.startsWith("http")) {
      return img;
    }

    // 如果後端回傳 /uploads/xxx.png
    if (img.startsWith("/uploads")) {
      return `${BASE_URL}${img}`;
    }

    return img;
  };

  const handleCheckout = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("請先登入");
      return;
    }

    const subtotal = getTotalCartAmount();

    if (subtotal === 0) {
      alert("購物車是空的");
      return;
    }

    navigate("/order");
  };

  return (
    <div className="cart">
      <div className="cart-item">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>

        <br />
        <hr />

        {drink_list.map((item) => {
          const quantity = cartItems[item.id] || 0;

          if (quantity > 0) {
            return (
              <div key={item.id}>
                <div className="cart-items-title cart-items-item">
                  <img src={getImageSrc(item)} alt={item.name} />

                  <p>{item.name}</p>
                  <p>NT{item.price}</p>
                  <p>{quantity}</p>
                  <p>NT{item.price * quantity}</p>

                  <p
                    onClick={() => removeFromCart(item.id)}
                    className="cross"
                  >
                    X
                  </p>
                </div>
                <hr />
              </div>
            );
          }

          return null;
        })}
      </div>

      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>

          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>NT{getTotalCartAmount()}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>NT{getTotalCartAmount() === 0 ? 0 : 30}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <b>Total</b>
              <b>
                NT
                {getTotalCartAmount() === 0
                  ? 0
                  : getTotalCartAmount() + 30}
              </b>
            </div>
          </div>

          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>

        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>

            <div className="cart-promocode-input">
              <input type="text" placeholder="promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;