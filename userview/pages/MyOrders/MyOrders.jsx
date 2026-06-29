import React, { useEffect, useState, useContext } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./MyOrders.css";

// ── Real backend import (used in production) ──────────────────────────────────
// Uncomment when your backend is connected.
// import { fetchUserOrders } from "../../service/orderService";
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLOR = {
  Preparing: { bg: "#fff8e6", color: "#b45309", dot: "#f59e0b" },
  "On the way": { bg: "#e6f0ff", color: "#1d4ed8", dot: "#3b82f6" },
  Delivered: { bg: "#edf4f0", color: "#1b3a2f", dot: "#22c55e" },
  Cancelled: { bg: "#fff0ec", color: "#e85a38", dot: "#ff6b47" },
};

/**
 * Groups an order's items by market (item.market — "Market 1" / "Market 2"),
 * NOT by category. A market can contain many food categories (Meat, Fish,
 * etc.) — categories are just a display label on each line, not a grouping key.
 */
const groupItemsByMarket = (orderedItems = []) => {
  const byMarket = orderedItems.reduce((acc, item) => {
    const market = item.market || "Other";
    if (!acc[market]) acc[market] = [];
    acc[market].push(item);
    return acc;
  }, {});
  return Object.entries(byMarket); // [[marketName, items[]], ...]
};

const MyOrders = () => {
  const { token } = useContext(StoreContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);

    // ── Real backend fetch (production) ──────────────────────────────────
    let realOrders = [];
    if (token) {
      try {
        // const response = await fetchUserOrders(token);
        // realOrders = response || [];
        realOrders = []; // placeholder — remove when import is uncommented
      } catch (error) {
        console.error("Error fetching orders:", error);
        realOrders = [];
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    // ── MOCK ORDER READ START ─────────────────────────────────────────────
    // Reads orders saved by PlaceOrder's mockSubmit during testing.
    // Used whenever the real fetch has nothing to show — regardless of
    // login state — so every order placed during mock testing stays visible.
    // DELETE this block when the real backend is connected; the real fetch
    // above will be the only source once `realOrders` is reliably populated.
    if (realOrders.length === 0) {
      const mockOrders = JSON.parse(sessionStorage.getItem("mockOrders") || "[]");
      setOrders(mockOrders);
      setLoading(false);
      return;
    }
    // ── MOCK ORDER READ END ───────────────────────────────────────────────

    setOrders(realOrders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const statusStyle = (status) =>
    STATUS_COLOR[status] || { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" };

  return (
    <div className="my-orders-page container py-5">
      <div className="my-orders-header">
        <h1 className="my-orders-heading">My Orders</h1>
        <button className="my-orders-refresh" onClick={fetchOrders} aria-label="Refresh orders">
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      {orders.length > 0 && String(orders[0].id).startsWith("mock_order_") && (
        <p className="mock-badge">
          🧪 Showing mock orders — connect the backend to see real orders
        </p>
      )}

      {loading ? (
        <div className="my-orders-loading">
          <div className="my-orders-spinner"></div>
          <p>Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="my-orders-empty">
          <i className="bi bi-bag-x my-orders-empty-icon"></i>
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order, index) => {
            const style = statusStyle(order.orderStatus);
            const marketGroups = groupItemsByMarket(order.orderedItems);

            return (
              <div className="order-card" key={order.id || index}>

                {/* ── Header: order id + date ── */}
                <div className="order-card-header">
                  <div className="order-meta">
                    <span className="order-id">
                      <i className="bi bi-receipt me-1"></i>
                      {String(order.id).startsWith("mock_order_")
                        ? "Mock Order"
                        : `#${order.id}`}
                    </span>
                    {order.createdAt && (
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span
                    className="order-status-badge"
                    style={{ background: style.bg, color: style.color }}
                  >
                    <span
                      className="order-status-dot"
                      style={{ background: style.dot }}
                    ></span>
                    {order.orderStatus}
                  </span>
                </div>

                {/* ── Items grouped by market ── */}
                <div className="order-markets">
                  {marketGroups.map(([market, items]) => {
                    const marketSubtotal = items.reduce(
                      (sum, item) => sum + Number(item.price) * Number(item.quantity),
                      0
                    );
                    return (
                      <div className="order-market-panel" key={market}>
                        <div className="order-market-header">
                          <i className="bi bi-shop me-2"></i>
                          {market}
                        </div>
                        <div className="order-items">
                          {/* Each line: name, category, unit price, qty, total — nothing more */}
                          {items.map((item, i) => (
                            <div className="order-item-row" key={i}>
                              <div className="order-item-info">
                                <span className="order-item-name">{item.name}</span>
                                <span className="order-item-category">{item.category}</span>
                              </div>
                              <span className="order-item-unit-price">
                                &#8377;{Number(item.price).toFixed(2)}
                              </span>
                              <span className="order-item-qty">×{item.quantity}</span>
                              <span className="order-item-total">
                                &#8377;{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="order-market-subtotal">
                          <span>Market subtotal</span>
                          <span>&#8377;{marketSubtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Footer: address + total ── */}
                <div className="order-card-footer">
                  <div className="order-address">
                    <i className="bi bi-geo-alt me-1"></i>
                    {order.userAddress}
                  </div>
                  <div className="order-total">
                    Total: <strong>&#8377;{Number(order.amount).toFixed(2)}</strong>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
