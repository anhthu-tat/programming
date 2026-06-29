import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import deal1 from "../../assets/Deal1.jpg";
import deal2 from "../../assets/Deal2.jpg";
import deal3 from "../../assets/Deal3.jpg";
import deal4 from "../../assets/Deal4.jpg";
import "./DealsForToday.css";

/**
 * MOCK DATA — used when the backend is not yet connected (foodList is empty).
 * Shared by ExploreMenu (main deals section) and FoodDetails (recommendations).
 * Replace these with real values once your backend is live.
 */
export const MOCK_DEALS = [
  { key: "deal1", img: deal1, market: "Market 1", name: "Milk 500ml", discount: "-50%", displayPrice: "$0.55", price: 0.55, description: "Fresh milk 500ml", foodId: "mock-deal-1" },
  { key: "deal2", img: deal2, market: "Market 2", name: "Meat 500g", discount: "-50%", displayPrice: "$6.55", price: 6.55, description: "Premium meat 500g", foodId: "mock-deal-2" },
  { key: "deal3", img: deal3, market: "Market 3", name: "Fish 500g", discount: "-50%", displayPrice: "$3.55", price: 3.55, description: "Fresh fish 500g", foodId: "mock-deal-3" },
  { key: "deal4", img: deal4, market: "Market 1", name: "Milk 500ml", discount: "-50%", displayPrice: "$0.55", price: 0.55, description: "Fresh milk 500ml", foodId: "mock-deal-4" },
];

/**
 * Seeds mock deals into sessionStorage so any page can resolve a
 * mock-deal-N id (e.g. FoodDetails) without depending on click order.
 * No-ops once the backend is connected (foodList.length > 0).
 */
export function useSeedMockDeals(foodList) {
  useEffect(() => {
    if (foodList.length > 0) return;
    const existing = JSON.parse(sessionStorage.getItem("mockFoodList") || "[]");
    const existingIds = new Set(existing.map((f) => f.id));
    const missing = MOCK_DEALS.filter((d) => !existingIds.has(d.foodId)).map((deal) => ({
      id: deal.foodId,
      name: deal.name,
      category: deal.market,
      price: deal.price,
      description: deal.description,
      imageUrl: deal.img,
    }));
    if (missing.length > 0) {
      sessionStorage.setItem("mockFoodList", JSON.stringify([...existing, ...missing]));
    }
  }, [foodList]);
}

/**
 * DealsForToday
 * --------------
 * title       - heading text ("Deal for Today" on ExploreMenu, "You might also like" on FoodDetails)
 * excludeId   - optional real or mock food id to omit from the list
 */
const DealsForToday = ({ title = "Deal for Today", excludeId = null }) => {
  const navigate = useNavigate();
  const { increaseQty, foodList } = useContext(StoreContext);

  useSeedMockDeals(foodList);

  const resolveFood = (deal) => {
    if (foodList.length > 0) {
      const found = foodList.find(
        (f) =>
          f.name.toLowerCase() === deal.name.toLowerCase() &&
          f.category === deal.market
      );
      return found ? found.id : deal.foodId;
    }
    return deal.foodId;
  };

  const visibleDeals = excludeId
    ? MOCK_DEALS.filter((deal) => resolveFood(deal) !== excludeId)
    : MOCK_DEALS;

  const handleAddDeal = (deal, e) => {
    e.stopPropagation();
    if (foodList.length > 0) {
      const found = foodList.find(
        (f) =>
          f.name.toLowerCase() === deal.name.toLowerCase() &&
          f.category === deal.market
      );
      if (found) {
        increaseQty(found.id);
      } else {
        console.warn(`No food matched name="${deal.name}" category="${deal.market}" in API data.`);
      }
    } else {
      increaseQty(deal.foodId);
    }
  };

  const handleCardClick = (deal) => navigate(`/food/${resolveFood(deal)}`);

  if (visibleDeals.length === 0) return null;

  return (
    <div className="deals-section">
      <h2 className="explore-menu-title">{title}</h2>
      <div className="deals-grid">
        {visibleDeals.map((deal) => (
          <div
            className="deal-card"
            key={deal.key}
            onClick={() => handleCardClick(deal)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleCardClick(deal)}
          >
            <div className="deal-market-badge">{deal.market}</div>
            <div className="deal-image-wrap">
              <img src={deal.img} alt={deal.name} className="deal-img" />
              <button
                className="deal-plus-btn"
                onClick={(e) => handleAddDeal(deal, e)}
                aria-label={`Add ${deal.name} to cart`}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>
            <div className="deal-info">
              <span className="deal-name">{deal.name}</span>
              <div className="deal-pricing">
                <span className="deal-discount">{deal.discount}</span>
                <span className="deal-price">{deal.displayPrice}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealsForToday;
