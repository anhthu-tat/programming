import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import header1 from "../../assets/Header1.png";
import header2 from "../../assets/Header2.jpg";
import header3 from "../../assets/Header3.jpg";

/**
 * Header
 * ------
 * Swipeable "hot deals" carousel using your own header images
 * (Header1/2/3 in src/assets). Each slide links to
 * /explore?category=<category> so Explore opens pre-filtered.
 *
 * HOT_DEALS is mock content for titles/categories — swap for a real
 * deals source whenever you have one; the images are already real.
 */

const HOT_DEALS = [
  {
    id: "hd1",
    title: "Farm-fresh basket, 30% off today",
    subtitle: "Salad",
    category: "Salad",
    img: header1,
  },
  {
    id: "hd2",
    title: "Weekend pizza bundle",
    subtitle: "Pizza",
    category: "Pizza",
    img: header2,
  },
  {
    id: "hd3",
    title: "Sweet tooth? Cakes are 20% off",
    subtitle: "Cake",
    category: "Cake",
    img: header3,
  },
];

const SWIPE_THRESHOLD = 50;

const Header = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const dragState = useRef({ startX: 0, dragging: false, moved: false });

  // Auto-advance every 5s
  useEffect(() => {
    const t = setInterval(() => {
      setActiveSlide((s) => (s + 1) % HOT_DEALS.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const goToSlide = (i) => setActiveSlide(i);
  const goToDeal = (deal) => navigate(`/explore?category=${encodeURIComponent(deal.category)}`);

  // --- Swipe / drag handling (touch + mouse) ---
  const handleDragStart = (clientX) => {
    dragState.current = { startX: clientX, dragging: true, moved: false };
  };

  const handleDragMove = (clientX) => {
    if (!dragState.current.dragging) return;
    if (Math.abs(clientX - dragState.current.startX) > 10) {
      dragState.current.moved = true;
    }
  };

  const handleDragEnd = (clientX) => {
    if (!dragState.current.dragging) return;
    const delta = clientX - dragState.current.startX;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) {
        setActiveSlide((s) => (s + 1) % HOT_DEALS.length); // swiped left -> next
      } else {
        setActiveSlide((s) => (s - 1 + HOT_DEALS.length) % HOT_DEALS.length); // swiped right -> prev
      }
    }
    dragState.current.dragging = false;
  };

  // A drag that moved past the threshold shouldn't also fire the slide's
  // click-to-navigate — otherwise dragging the carousel accidentally
  // sends you to /explore every time.
  const handleSlideClick = (deal, e) => {
    if (dragState.current.moved) {
      e.preventDefault();
      return;
    }
    goToDeal(deal);
  };

  return (
    <section className="header-hot-deals">
      <div className="hot-deals-label">
        <span className="eyebrow">Hot deals</span>
        <h2>Today's picks, picked fast</h2>
      </div>

      <div
        className="carousel"
        ref={trackRef}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={(e) => handleDragEnd(e.clientX)}
        onMouseLeave={() => (dragState.current.dragging = false)}
      >
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {HOT_DEALS.map((deal) => (
            <button
              className="carousel-slide"
              key={deal.id}
              onClick={(e) => handleSlideClick(deal, e)}
              aria-label={`View ${deal.subtitle} deals`}
            >
              <img src={deal.img} alt={deal.title} draggable={false} />
              <div className="carousel-caption">
                <span className="carousel-tag">{deal.subtitle}</span>
                <span className="carousel-title">{deal.title}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="dot-trail">
          {HOT_DEALS.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === activeSlide ? "dot-active" : ""}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Header;
