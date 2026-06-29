import React, { useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";

const FoodDisplay = ({ category, searchText }) => {
  const { foodList } = useContext(StoreContext);
  const filteredFoods = foodList.filter(
    (food) =>
      (category === "All" || food.category === category) &&
      food.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <section className="food-display">
      {filteredFoods.length > 0 ? (
        <div className="food-grid">
          {filteredFoods.map((food, index) => (
            <FoodItem
              key={index}
              name={food.name}
              description={food.description}
              category={food.category}
              market={food.market}
              id={food.id}
              imageUrl={food.imageUrl}
              price={food.price}
            />
          ))}
        </div>
      ) : (
        <div className="no-food-found">
          <h4>No food found.</h4>
        </div>
      )}
    </section>
  );
};

export default FoodDisplay;
