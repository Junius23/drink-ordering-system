import { createContext, useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../cors/config";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [drink_list, setDrinkList] = useState([]);
  const [cartItems, setCartItems] = useState({});

  useEffect(() => {
    axios
      .get(`${BASE_URL}/auth/drinks`)
      .then((res) => {
        setDrinkList(res.data || []);
      })
      .catch((err) => {
        console.error("載入飲料失敗：", err);
      });
  }, []);

  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      if (!prev[itemId]) return prev;
      const updated = { ...prev };
      if (updated[itemId] === 1) {
        delete updated[itemId];
      } else {
        updated[itemId] -= 1;
      }
      return updated;
    });
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const id in cartItems) {
      const qty = cartItems[id];
      const drink = drink_list.find((d) => d.id === Number(id));
      if (!drink) continue;
      totalAmount += drink.price * qty;
    }
    return totalAmount;
  };

  const contextValue = {
    drink_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
