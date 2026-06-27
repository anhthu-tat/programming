import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFoodDetails } from "../../service/foodService";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import Menubar from "../../components/Menubar/Menubar";
import DealsForToday from "../../components/DealsForToday/DealsForToday";
import "./FoodDetails.css";

const FoodDetails = () => {
  const { id } = useParams();
  const { increaseQty, decreaseQty, quantities } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const qty = quantities[data.id] || 0;

  useEffect(() => {
    const loadFoodDetails = async () => {
      setLoading(true);
      try {
        // ── Real backend call — untouched, same as before ──
        const foodData = await fetchFoodDetails(id);
        if (foodData && foodData.id) {
          setData(foodData);
          return;
        }
        throw new Error("Empty response");
      } catch (error) {
        // ── Backend not connected yet: fall back to the same mock data
        //    ExploreMenu/Cart use, so deal cards remain clickable end-to-end ──
        const mockFoodList = JSON.parse(sessionStorage.getItem("mockFoodList") || "[]");
        const mockMatch = mockFoodList.find((f) => f.id === id);
        if (mockMatch) {
          setData(mockMatch);
        } else {
          toast.error("Error displaying the food details.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadFoodDetails();
  }, [id]);

  const handleAdd = () => {
    increaseQty(data.id);
  };

  if (loading) {
    return (
      <div className="food-details-page">
        <Menubar />
        <div className="food-details-loading">Loading…</div>
      </div>
    );
  }

  if (!data.id) {
    return (
      <div className="food-details-page">
        <Menubar />
        <div className="food-details-empty">
          <p>We couldn't find that item.</p>
          <button className="back-btn" onClick={() => navigate(-1)}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="food-details-page">

      <div className="food-details-toolbar">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <BackIcon />
          Back
        </button>
      </div>

      <section className="food-details-content">
        <div className="food-details-img-wrap">
          <img src={data.imageUrl} alt={data.name} />
        </div>

        <div className="food-details-info">
          {data.category && <span className="market-tag">{data.category}</span>}

          <h1 className="food-details-name">{data.name}</h1>

          <div className="food-details-rating">
            <StarIcon filled />
            <StarIcon filled />
            <StarIcon filled />
            <StarIcon filled />
            <StarIcon half />
            <span className="rating-count">(4.5)</span>
          </div>

          <p className="food-details-description">{data.description}</p>

          <div className="food-details-price-row">
            <span className="food-details-price">&#8377;{data.price}</span>
          </div>

          {qty > 0 ? (
            <div className="food-details-stepper">
              <button onClick={() => decreaseQty(data.id)} aria-label="Remove one">
                <MinusIcon />
              </button>
              <span>{qty}</span>
              <button onClick={() => increaseQty(data.id)} aria-label="Add one more">
                <PlusIcon />
              </button>
            </div>
          ) : (
            <button className="add-to-cart-btn" onClick={handleAdd}>
              <CartIcon />
              Add to cart
            </button>
          )}
        </div>
      </section>

      <section className="food-details-recommendations">
        <DealsForToday title="You might also like" />
      </section>
    </div>
  );
};

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 3h2l.4 2M7 13h10l3-7H5.4M7 13L5.4 5M7 13l-1.5 4h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}

function StarIcon({ filled, half }) {
  if (half) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="fd-half-star">
            <stop offset="50%" stopColor="var(--gold)" />
            <stop offset="50%" stopColor="#e7e1d6" />
          </linearGradient>
        </defs>
        <path fill="url(#fd-half-star)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "var(--gold)" : "#e7e1d6"}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default FoodDetails;
