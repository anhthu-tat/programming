import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./Cart.css";

const SHIPPING_FEE = 2.0;
const TAX_RATE = 0.1; // 10%

const Cart = () => {
  const navigate = useNavigate();
  const { foodList, increaseQty, decreaseQty, removeFromCart, quantities } =
    useContext(StoreContext);

  /**
   * Merge real foodList with any mock deals stored in sessionStorage.
   * Mock deals are only present when the backend isn't connected yet.
   * Once the backend is live, sessionStorage will be empty and this is a no-op.
   */
  const mockFoodList = JSON.parse(sessionStorage.getItem("mockFoodList") || "[]");
  const knownFoods = foodList.length > 0 ? foodList : mockFoodList;

  /* ── Build list of cart items (qty > 0) ── */
  const cartItems = knownFoods.filter((food) => (quantities[food.id] || 0) > 0);

  /* ── Group by category (= "Market") ── */
  const byMarket = cartItems.reduce((acc, food) => {
    const market = food.category || "Other";
    if (!acc[market]) acc[market] = [];
    acc[market].push(food);
    return acc;
  }, {});
  const markets = Object.keys(byMarket);

  /* ── Totals ── */
  const subtotal = cartItems.reduce(
    (sum, food) => sum + food.price * (quantities[food.id] || 0),
    0
  );
  const shipping = subtotal > 0 ? SHIPPING_FEE : 0;
  const tax      = subtotal * TAX_RATE;
  const total    = subtotal + shipping + tax;

  return (
    <div className="cart-page container py-5">
      <h1 className="cart-heading">Shopping Cart</h1>

      <div className="cart-layout">
        {/* ══ LEFT: market panels ══ */}
        <div className="cart-panels">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <i className="bi bi-cart-x cart-empty-icon"></i>
              <p>Your cart is empty.</p>
              <Link to="/" className="btn-continue">Start shopping</Link>
            </div>
          ) : (
            markets.map((market) => (
              <div className="market-panel" key={market}>
                <div className="market-header">
                  <i className="bi bi-shop me-2"></i>{market}
                </div>
                <div className="market-items">
                  {byMarket[market].map((food) => (
                    <div className="cart-item" key={food.id}>
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="cart-item-img"
                      />
                      <div className="cart-item-desc">
                        <span className="cart-item-name">{food.name}</span>
                        <span className="cart-item-category">{food.category}</span>
                        <span className="cart-item-unit-price">
                          &#8377;{food.price.toFixed(2)} each
                        </span>
                      </div>
                      <div className="cart-item-qty">
                        <button
                          className="qty-btn"
                          onClick={() => decreaseQty(food.id)}
                          aria-label="Decrease quantity"
                        >
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="qty-value">{quantities[food.id]}</span>
                        <button
                          className="qty-btn"
                          onClick={() => increaseQty(food.id)}
                          aria-label="Increase quantity"
                        >
                          <i className="bi bi-plus"></i>
                        </button>
                      </div>
                      <div className="cart-item-total">
                        &#8377;{(food.price * quantities[food.id]).toFixed(2)}
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(food.id)}
                        aria-label="Remove item"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          {cartItems.length > 0 && (
            <Link to="/" className="btn-continue">
              <i className="bi bi-arrow-left me-1"></i>Continue Shopping
            </Link>
          )}
        </div>

        {/* ══ RIGHT: order summary ══ */}
        <div className="order-summary">
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-row">
            <span>Sub Total</span>
            <span>&#8377;{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "—" : `₹${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax (10%)</span>
            <span>&#8377;{tax.toFixed(2)}</span>
          </div>
          <hr className="summary-divider" />
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>&#8377;{total.toFixed(2)}</span>
          </div>
          <button
            className="btn-checkout"
            disabled={cartItems.length === 0}
            onClick={() => navigate("/order")}
          >
            Check out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
