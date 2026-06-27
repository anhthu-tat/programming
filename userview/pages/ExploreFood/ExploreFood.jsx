import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import Menubar from "../../components/Menubar/Menubar";
import DealsForToday from "../../components/DealsForToday/DealsForToday";
import "./ExploreFood.css";

const CATEGORIES = [
  "All",
  "Biryani",
  "Burger",
  "Cake",
  "Ice cream",
  "Pizza",
  "Rolls",
  "Salad",
];

const ExploreFood = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const initialCategory = CATEGORIES.includes(categoryFromUrl) ? categoryFromUrl : "All";

  const [category, setCategory] = useState(initialCategory);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  return (
    <div className="explore-page">

      <div className="explore-toolbar">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <BackIcon />
          Back
        </button>

        <form className="search-bar" onSubmit={(e) => e.preventDefault()}>
          <select
            className="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="search-input"
            placeholder="Search your favorite dish..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <button className="search-btn" type="submit" aria-label="Search">
            <SearchIcon />
          </button>
        </form>
      </div>

      <FoodDisplay category={category} searchText={searchText} />

      <section className="explore-recommendations">
        <DealsForToday title="Deal for Today" />
      </section>
    </div>
  );
};

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default ExploreFood;
