import React, { useContext, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// ── Real Razorpay & backend imports (used in production) ──────────────────────
// Uncomment these when your backend is connected and Razorpay is configured.
//
// import { RAZORPAY_KEY } from "../../util/contants";
// import { createOrder, deleteOrder, verifyPayment } from "../../service/orderService";
// import { clearCartItems } from "../../service/cartService";
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MARKET CONFIG
 * Each market has its own shipping fee and delivery time. There are only
 * 2 real markets ("Market 1", "Market 2") — these are separate from a
 * food's category (Meat, Fish, etc.); a market can contain many categories.
 * Update the keys to match your real market names from the backend.
 */
const MARKET_CONFIG = {
  "Market 1": { shipping: 2.0, delivery: "20 – 30 minutes" },
  "Market 2": { shipping: 3.5, delivery: "35 – 50 minutes" },
  default: { shipping: 2.0, delivery: "30 – 45 minutes" },
};

const TAX_RATE = 0.1; // 10%

const PlaceOrder = () => {
  const { foodList, quantities, setQuantities, token } = useContext(StoreContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    state: "",
    city: "",
    zip: "",
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Resolve food list (real backend or sessionStorage mock) ──────────────
  const mockFoodList = JSON.parse(sessionStorage.getItem("mockFoodList") || "[]");
  const knownFoods = foodList.length > 0 ? foodList : mockFoodList;
  const cartItems = knownFoods.filter((food) => (quantities[food.id] || 0) > 0);

  // ── Group cart items by market (NOT category — a market can hold many
  //    categories; there are only 2 real markets) ──────────────────────────
  const byMarket = cartItems.reduce((acc, food) => {
    const market = food.market || "default";
    if (!acc[market]) acc[market] = [];
    acc[market].push(food);
    return acc;
  }, {});
  const markets = Object.keys(byMarket);

  // ── Per-market totals ────────────────────────────────────────────────────
  const marketTotals = markets.map((market) => {
    const config = MARKET_CONFIG[market] || MARKET_CONFIG.default;
    const items = byMarket[market];
    const subtotal = items.reduce(
      (sum, food) => sum + food.price * (quantities[food.id] || 0),
      0
    );
    return {
      market,
      items,
      subtotal,
      shipping: config.shipping,
      delivery: config.delivery,
    };
  });

  // ── Grand totals (across all markets) ───────────────────────────────────
  const grandSubtotal = marketTotals.reduce((s, m) => s + m.subtotal, 0);
  const grandShipping = marketTotals.reduce((s, m) => s + (m.subtotal > 0 ? m.shipping : 0), 0);
  const grandTax      = grandSubtotal * TAX_RATE;
  const grandTotal    = grandSubtotal + grandShipping + grandTax;

  // ── Build orderData shape (backend-ready) ────────────────────────────────
  // Each line now carries BOTH category (Meat, Fish, etc.) and market
  // (Market 1 / Market 2) since they're separate fields on the real food object.
  const buildOrderData = () => ({
    userAddress: `${data.firstName} ${data.lastName}, ${data.address}, ${data.city}, ${data.state}, ${data.zip}`,
    phoneNumber: data.phoneNumber,
    email: data.email,
    orderedItems: cartItems.map((item) => ({
      foodId: item.id,               // matches backend field
      quantity: quantities[item.id],
      price: item.price,             // unit price — total is derived at display time
      category: item.category,
      market: item.market,
      imageUrl: item.imageUrl,
      description: item.description,
      name: item.name,
    })),
    amount: grandTotal.toFixed(2),
    orderStatus: "Preparing",
  });

  // ════════════════════════════════════════════════════════════════════════
  // ── MOCK PAYMENT BLOCK START ─────────────────────────────────────────
  // Purpose: lets you test the full order flow without Razorpay or a backend.
  // HOW TO DELETE WHEN GOING LIVE:
  //   1. Remove this entire block (everything between the two dashed comments).
  //   2. In onSubmitHandler, remove the `USE_MOCK_PAYMENT` branch entirely,
  //      keeping only the real Razorpay branch below it.
  //   3. Uncomment the real imports at the top of this file.
  // ─────────────────────────────────────────────────────────────────────
  const USE_MOCK_PAYMENT = true; // ← flip to false when Razorpay is ready

  const mockSubmit = async (orderData) => {
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 800));

    // Print what would have been sent to the backend
    console.log("📦 [MOCK] Order data that will be sent to backend:", orderData);

    // Simulate a successful payment
    const mockOrderId = "mock_order_" + Date.now();
    console.log("💳 [MOCK] Razorpay order created:", mockOrderId);
    console.log("✅ [MOCK] Payment verified successfully.");

    // ── MOCK ORDER STORAGE START ──────────────────────────────────────────
    // Saves the order to sessionStorage so MyOrders can display it during testing.
    // DELETE this block when the real backend is connected (MyOrders will fetch
    // from the API instead and sessionStorage orders won't be read).
    const existingOrders = JSON.parse(sessionStorage.getItem("mockOrders") || "[]");
    existingOrders.unshift({
      id: mockOrderId,
      ...orderData,
      paymentStatus: "Paid",
      createdAt: new Date().toISOString(),
    });
    sessionStorage.setItem("mockOrders", JSON.stringify(existingOrders));
    // ── MOCK ORDER STORAGE END ────────────────────────────────────────────

    // Clear cart quantities (mirrors clearCartItems behaviour)
    setQuantities({});
    sessionStorage.removeItem("mockFoodList");

    toast.success("(Mock) Payment successful! Order placed.");
    navigate("/myorders");
  };
  // ── MOCK PAYMENT BLOCK END ────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════

  // ── REAL Razorpay handlers (production — kept intact) ────────────────────
  // These run only when USE_MOCK_PAYMENT is false.

  const initiateRazorpayPayment = (order) => {
    // Uncomment RAZORPAY_KEY import at the top when using this.
    const options = {
      key: "", // replace with RAZORPAY_KEY import
      amount: order.amount,
      currency: "INR",
      name: "Food Land",
      description: "Food order payment",
      order_id: order.razorpayOrderId,
      handler: verifyPaymentHandler,
      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phoneNumber,
      },
      theme: { color: "#3399cc" },
      modal: {
        ondismiss: deleteOrderHandler,
      },
    };
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifyPaymentHandler = async (razorpayResponse) => {
    const paymentData = {
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_order_id:   razorpayResponse.razorpay_order_id,
      razorpay_signature:  razorpayResponse.razorpay_signature,
    };
    try {
      // const success = await verifyPayment(paymentData, token);
      const success = false; // placeholder — remove when imports are uncommented
      if (success) {
        toast.success("Payment successful.");
        // await clearCartItems(token, setQuantities);
        navigate("/myorders");
      } else {
        toast.error("Payment failed. Please try again.");
        navigate("/");
      }
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    }
  };

  const deleteOrderHandler = async (orderId) => {
    try {
      // await deleteOrder(orderId, token);
    } catch (error) {
      toast.error("Something went wrong. Contact support.");
    }
  };
  // ── END real Razorpay handlers ────────────────────────────────────────────

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const orderData = buildOrderData();

    // ── MOCK PAYMENT BLOCK START (remove this branch when going live) ──────
    if (USE_MOCK_PAYMENT) {
      await mockSubmit(orderData);
      return;
    }
    // ── MOCK PAYMENT BLOCK END ─────────────────────────────────────────────

    // ── Real flow (production) ─────────────────────────────────────────────
    try {
      // const response = await createOrder(orderData, token);
      const response = null; // placeholder — remove when imports are uncommented
      if (response && response.razorpayOrderId) {
        initiateRazorpayPayment(response);
      } else {
        toast.error("Unable to place order. Please try again.");
      }
    } catch (error) {
      toast.error("Unable to place order. Please try again.");
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="place-order-page container py-5">
      <h1 className="place-order-heading">Place Order</h1>

      <div className="place-order-layout">

        {/* ══ LEFT: billing form ══ */}
        <div className="info-panel">
          <div className="info-panel-header">Check your Information</div>

          <form className="info-form" onSubmit={onSubmitHandler} id="place-order-form">

            {/* Name row */}
            <div className="form-row form-row--split">
              <div className="form-field">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={data.firstName}
                  onChange={onChangeHandler}
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={data.lastName}
                  onChange={onChangeHandler}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={data.email}
                onChange={onChangeHandler}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phoneNumber"
                type="tel"
                placeholder="9876543210"
                value={data.phoneNumber}
                onChange={onChangeHandler}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="1234 Main St"
                value={data.address}
                onChange={onChangeHandler}
                required
              />
            </div>

            {/* State / City / Zip */}
            <div className="form-row form-row--triple">
              <div className="form-field">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  placeholder="Hessen"
                  value={data.state}
                  onChange={onChangeHandler}
                  required
                >
                </input>
              </div>
              <div className="form-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  placeholder="Frankfurt"
                  value={data.city}
                  onChange={onChangeHandler}
                  required
                >
                </input>
              </div>
              <div className="form-field">
                <label htmlFor="zip">Zip Code</label>
                <input
                  id="zip"
                  name="zip"
                  type="number"
                  placeholder="98745"
                  value={data.zip}
                  onChange={onChangeHandler}
                  required
                />
              </div>
            </div>

            {/* Per-market delivery time info */}
            {marketTotals.length > 0 && (
              <div className="form-row form-row--delivery">
                <label>Delivery Times</label>
                <div className="delivery-times">
                  {marketTotals.map(({ market, delivery }) => (
                    <div key={market} className="delivery-time-row">
                      <span className="delivery-market">{market}</span>
                      <span className="delivery-eta">{delivery}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-row">
              <label htmlFor="note">Note</label>
              <textarea
                id="note"
                name="note"
                rows={2}
                placeholder="Any special instructions? (optional)"
              />
            </div>

          </form>
        </div>

        {/* ══ RIGHT: order summary ══ */}
        <div className="order-summary">
          <h2 className="summary-title">Order Summary</h2>

          {/* Per-market breakdown */}
          {marketTotals.map(({ market, items, subtotal, shipping }) => (
            <div key={market} className="summary-market-block">
              <div className="summary-market-name">
                <i className="bi bi-shop me-1"></i>{market}
              </div>
              {items.map((food) => (
                <div key={food.id} className="summary-item-row">
                  <span className="summary-item-name">
                    {food.name}
                    <span className="summary-item-qty">× {quantities[food.id]}</span>
                  </span>
                  <span>&#8377;{(food.price * quantities[food.id]).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-row summary-row--sub">
                <span>Subtotal</span>
                <span>&#8377;{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row summary-row--sub">
                <span>Shipping</span>
                <span>&#8377;{shipping.toFixed(2)}</span>
              </div>
            </div>
          ))}

          <hr className="summary-divider" />

          <div className="summary-row">
            <span>Items Subtotal</span>
            <span>&#8377;{grandSubtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Total Shipping</span>
            <span>{grandShipping === 0 ? "—" : `₹${grandShipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax (10%)</span>
            <span>&#8377;{grandTax.toFixed(2)}</span>
          </div>

          <hr className="summary-divider" />

          <div className="summary-row summary-total">
            <span>Total</span>
            <span>&#8377;{grandTotal.toFixed(2)}</span>
          </div>

          <button
            className="btn-continue-order"
            type="submit"
            form="place-order-form"
            disabled={cartItems.length === 0}
          >
            {/* Label changes in mock mode so it's obvious during testing */}
            {USE_MOCK_PAYMENT ? "Continue (Mock)" : "Continue to Checkout"}
          </button>

          {/* Visual indicator shown only in mock mode */}
          {USE_MOCK_PAYMENT && (
            <p className="mock-badge">
              🧪 Mock payment active — no real charge
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default PlaceOrder;
