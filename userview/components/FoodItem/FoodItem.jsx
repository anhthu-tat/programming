import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";


const FoodItem = ({ name, description, category, id, imageUrl, price }) => {
  const { increaseQty, decreaseQty, quantities } = useContext(StoreContext);
  const [justAdded, setJustAdded] = useState(false);
  const qty = quantities[id] || 0;

  const handleAdd = () => {
    increaseQty(id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  };

  return (
    <article className="food-card">
      <div className="food-card-top">
        {category && <span className="market-tag">{category}</span>}
      </div>

      <Link to={`/food/${id}`} className="food-img-wrap">
        <img src={imageUrl} alt={name} />
      </Link>

      {qty > 0 ? (
        <div className="qty-stepper">
          <button onClick={() => decreaseQty(id)} aria-label={`Remove one ${name}`}>
            <MinusIcon />
          </button>
          <span>{qty}</span>
          <button onClick={() => increaseQty(id)} aria-label={`Add one more ${name}`}>
            <PlusIcon />
          </button>
        </div>
      ) : (
        <button
          className={`plus-btn ${justAdded ? "plus-btn--pop" : ""}`}
          onClick={handleAdd}
          aria-label={`Add ${name} to cart`}
        >
          <PlusIcon />
        </button>
      )}

      <div className="food-info">
        <div className="food-name-row">
          <span className="food-name">{name}</span>
          <span className="food-price">&#8377;{price}</span>
        </div>
        <p className="food-description">{description}</p>
        <div className="food-footer">
          <div className="stars" aria-label="Rated 4.5 out of 5">
            <StarIcon filled />
            <StarIcon filled />
            <StarIcon filled />
            <StarIcon filled />
            <StarIcon half />
            <span className="rating-count">(4.5)</span>
          </div>
          <Link to={`/food/${id}`} className="view-food-link">
            View food
          </Link>
        </div>
      </div>
    </article>
  );
};

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ filled, half }) {
  if (half) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="half-star">
            <stop offset="50%" stopColor="var(--gold)" />
            <stop offset="50%" stopColor="#e7e1d6" />
          </linearGradient>
        </defs>
        <path
          fill="url(#half-star)"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "var(--gold)" : "#e7e1d6"}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default FoodItem;
