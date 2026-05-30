import React, { useContext } from "react";
import "./DrinkDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import DrinkItem from "../DrinkItem/DrinkItem";

const DrinkDisplay = ({ category }) => {
  const { drink_list } = useContext(StoreContext);

  console.log("DrinkDisplay drink_list =", drink_list);
  console.log("目前分類 category =", category);

  return (
    <div className="drink-display" id="drink-display">
      <h2>Top Drinks Near You</h2>

      {drink_list.length === 0 ? (
        <p className="no-drinks">目前沒有飲料資料，請確認 API 是否有回傳。</p>
      ) : (
        <div className="drink-display-list">
          {drink_list.map((item) => (
            <DrinkItem
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.imageUrl || item.image_url || item.image}
              category={item.category}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DrinkDisplay;