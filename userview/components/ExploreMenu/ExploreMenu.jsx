import React, { useRef } from "react";
import { categories } from "../../assets/assets";
import DealsForToday from "../DealsForToday/DealsForToday";
import "./ExploreMenu.css";

const ExploreMenu = ({ category, setCategory }) => {
  const menuRef = useRef(null);

  const scrollLeft = () => menuRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  const scrollRight = () => menuRef.current?.scrollBy({ left: 200, behavior: "smooth" });

  return (
    <div className="explore-menu">
      {/* ── Category pill strip ── */}
      <div className="explore-menu-header">
        <h2 className="explore-menu-title">Explore Our Menu</h2>
        <div className="scroll-arrows">
          <button className="scroll-btn" onClick={scrollLeft} aria-label="Scroll left">
            <i className="bi bi-arrow-left-circle"></i>
          </button>
          <button className="scroll-btn" onClick={scrollRight} aria-label="Scroll right">
            <i className="bi bi-arrow-right-circle"></i>
          </button>
        </div>
      </div>

      <div className="explore-menu-list" ref={menuRef}>
        {categories.map((item, index) => (
          <button
            key={index}
            className={`category-pill ${item.category === category ? "active" : ""}`}
            onClick={() =>
              setCategory((prev) => (prev === item.category ? "All" : item.category))
            }
          >
            {item.category}
          </button>
        ))}
      </div>

      <hr className="explore-divider" />

      {/* ── Deal for Today ── */}
      <DealsForToday title="Deal for Today" />
    </div>
  );
};

export default ExploreMenu;
