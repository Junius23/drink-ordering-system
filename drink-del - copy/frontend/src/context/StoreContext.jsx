import { createContext, useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../cors/config";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [drink_list, setDrinkList] = useState([]);

  const fetchDrinkList = async () => {
    try {
      // 你的後端前台 API 是 /auth/drinks
      const response = await axios.get(`${BASE_URL}/auth/drinks`);

      console.log("飲料 API 回傳 =", response.data);

      let drinks = [];

      if (Array.isArray(response.data)) {
        drinks = response.data;
      } else if (Array.isArray(response.data.data)) {
        drinks = response.data.data;
      } else if (Array.isArray(response.data.drinks)) {
        drinks = response.data.drinks;
      }

      const fixedDrinks = drinks.map((drink) => ({
        ...drink,
        id: drink.id,
        name: drink.name || "",
        price: Number(drink.price || 0),
        description: drink.description || "",
        category: drink.category || "All",
        imageUrl: drink.imageUrl || drink.image_url || drink.image || "",
        soldOut: drink.soldOut || drink.sold_out || false,
        active: drink.active,
      }));

      console.log("整理後飲料資料 =", fixedDrinks);

      setDrinkList(fixedDrinks);
    } catch (error) {
      console.error("Fetch drink list error:", error);
      setDrinkList([]);
    }
  };

  const addToCart = (itemId) => {
    setCartItems((prev) => {
      const id = String(itemId);

      const newCart = {
        ...prev,
        [id]: (prev[id] || 0) + 1,
      };

      localStorage.setItem("cartItems", JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const id = String(itemId);
      const newCart = { ...prev };

      if (newCart[id] > 1) {
        newCart[id] -= 1;
      } else {
        delete newCart[id];
      }

      localStorage.setItem("cartItems", JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCartItems({});
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cart");
    localStorage.removeItem("cart_items");
    localStorage.removeItem("cartData");
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;

    for (const itemId in cartItems) {
      const quantity = cartItems[itemId];

      if (quantity > 0) {
        const itemInfo = drink_list.find(
          (product) => String(product.id) === String(itemId)
        );

        if (itemInfo) {
          totalAmount += Number(itemInfo.price) * Number(quantity);
        }
      }
    }

    return totalAmount;
  };

  useEffect(() => {
    fetchDrinkList();

    const savedCart = localStorage.getItem("cartItems");

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Cart parse error:", error);
        localStorage.removeItem("cartItems");
        setCartItems({});
      }
    }

    // 每 5 秒重新抓一次飲料，不是整頁刷新
    const interval = setInterval(() => {
      fetchDrinkList();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const contextValue = {
    drink_list,
    setDrinkList,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount,
    fetchDrinkList,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;