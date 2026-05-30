import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import BASE_URL from "../../cors/config";

const PlaceOrder = () => {
  const { cartItems, drink_list, getTotalCartAmount, clearCart } =
    useContext(StoreContext);

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    zip: "",
    country: "",
    phone: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  });

  const subtotal = getTotalCartAmount();
  const deliveryFee = subtotal === 0 ? 0 : 30;
  const total = subtotal + deliveryFee;

  const handleInput = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCardInput = (e) => {
    setCardInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("請先登入！");
      return;
    }

    if (subtotal === 0) {
      alert("購物車是空的");
      return;
    }

    if (paymentMethod === "Credit Card") {
      if (
        !cardInfo.cardNumber ||
        !cardInfo.cardName ||
        !cardInfo.expiry ||
        !cardInfo.cvc
      ) {
        alert("請完整填寫信用卡資料");
        return;
      }
    }

    const items = drink_list
      .filter(
        (item) =>
          (cartItems[String(item.id)] || cartItems[item.id] || 0) > 0
      )
      .map((item) => {
        const quantity = cartItems[String(item.id)] || cartItems[item.id] || 0;

        return {
          drinkId: String(item.id),
          name: item.name,
          price: item.price,
          quantity,
        };
      });

    if (items.length === 0) {
      alert("購物車是空的");
      return;
    }

    // 送出前讓顧客確認訂單，避免送錯
    const itemText = items
      .map(
        (item) =>
          `${item.name} x ${item.quantity} = NT${item.price * item.quantity}`
      )
      .join("\n");

    const confirmText = `請確認訂單內容：

商品：
${itemText}

小計：NT${subtotal}
外送費：NT${deliveryFee}
總金額：NT${total}

付款方式：${paymentMethod}

收件人：${formData.firstName} ${formData.lastName}
Email：${formData.email}
電話：${formData.phone}
地址：${formData.street}, ${formData.zip}, ${formData.country}

確認送出訂單嗎？`;

    const confirmed = window.confirm(confirmText);

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/order/create`,
        {
          customerInfo: formData,
          items,
          subtotal,
          deliveryFee,
          total,
          paymentMethod,
          cardLast4:
            paymentMethod === "Credit Card"
              ? cardInfo.cardNumber.slice(-4)
              : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("訂單已建立！");

      clearCart();

      navigate("/profile");
    } catch (err) {
      console.error("Create order error:", err);
      console.log("ERROR RESPONSE =", err.response);

      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        `HTTP ${err.response?.status || ""} ${err.message}`;

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>

        <div className="multi-fields">
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleInput}
            type="text"
            placeholder="First name"
            required
          />

          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleInput}
            type="text"
            placeholder="Last name"
            required
          />
        </div>

        <input
          name="email"
          value={formData.email}
          onChange={handleInput}
          type="email"
          placeholder="Email address"
          required
        />

        <input
          name="street"
          value={formData.street}
          onChange={handleInput}
          type="text"
          placeholder="Street"
          required
        />

        <div className="multi-fields">
          <input
            name="zip"
            value={formData.zip}
            onChange={handleInput}
            type="text"
            placeholder="Zip code"
            required
          />

          <input
            name="country"
            value={formData.country}
            onChange={handleInput}
            type="text"
            placeholder="Country"
            required
          />
        </div>

        <input
          name="phone"
          value={formData.phone}
          onChange={handleInput}
          type="text"
          placeholder="Phone"
          required
        />

        <p className="title" style={{ marginTop: "25px" }}>
          Payment Method
        </p>

        <div className="payment-options">
          {["Credit Card", "Cash on Delivery", "Line Pay", "Apple Pay"].map(
            (method) => (
              <label className="payment-option" key={method}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>{method}</span>
              </label>
            )
          )}
        </div>

        {paymentMethod === "Credit Card" && (
          <div className="card-section">
            <p className="title" style={{ marginTop: "15px" }}>
              Card Information
            </p>

            <span className="payment-label">
              Credit Card
              <img src={assets.visa} alt="Visa" className="payment-icon" />
              <img
                src={assets.master_card}
                alt="MasterCard"
                className="payment-icon"
              />
            </span>

            <input
              name="cardNumber"
              value={cardInfo.cardNumber}
              type="text"
              placeholder="Card Number"
              onChange={handleCardInput}
            />

            <input
              name="cardName"
              value={cardInfo.cardName}
              type="text"
              placeholder="Name on Card"
              onChange={handleCardInput}
            />

            <div className="multi-fields">
              <input
                name="expiry"
                value={cardInfo.expiry}
                type="text"
                placeholder="MM/YY"
                onChange={handleCardInput}
              />

              <input
                name="cvc"
                value={cardInfo.cvc}
                type="text"
                placeholder="CVC"
                onChange={handleCardInput}
              />
            </div>
          </div>
        )}
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>

          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>NT${subtotal}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>NT${deliveryFee}</p>
            </div>

            <hr />

            <div className="cart-total-details">
              <b>Total</b>
              <b>NT${total}</b>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "PLEASE WAIT..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;