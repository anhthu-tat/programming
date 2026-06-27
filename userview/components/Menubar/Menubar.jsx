import React, { useContext, useState } from "react";
import "./Menubar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Menubar = () => {
  const [active, setActive] = useState("home");
  const { quantities, token, setToken, setQuantities } =
    useContext(StoreContext);
  const uniqueItemsInCart = Object.values(quantities).filter(
    (qty) => qty > 0
  ).length;
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setQuantities({});
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg menubar">
      <div className="container">
        <Link to="/" onClick={() => setActive("home")}>
          <img src={assets.logo} alt="" className="menubar-logo" height={44} width={44} />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={active === "home" ? "nav-link active" : "nav-link"}
                to="/"
                onClick={() => setActive("home")}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={active === "explore" ? "nav-link active" : "nav-link"}
                to="/explore"
                onClick={() => setActive("explore")}
              >
                Explore
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={active === "contact-us" ? "nav-link active" : "nav-link"}
                to="/contact"
                onClick={() => setActive("contact-us")}
              >
                Contact us
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-4">
            <Link to="/cart" className="cart-link">
              <div className="position-relative cart-icon-wrap">
                <img src={assets.cart} alt="" height={26} width={26} />
                {uniqueItemsInCart > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill cart-badge-pill">
                    {uniqueItemsInCart}
                  </span>
                )}
              </div>
            </Link>

            {!token ? (
              <>
                <button className="btn btn-outline-menubar btn-sm" onClick={() => navigate("/login")}>
                  Login
                </button>
                <button className="btn btn-fill-menubar btn-sm" onClick={() => navigate("/register")}>
                  Register
                </button>
              </>
            ) : (
              <div className="dropdown text-end">
                <a
                  href="#"
                  className="d-block link-body-emphasis text-decoration-none dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={assets.profile}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-circle profile-avatar"
                  />
                </a>
                <ul className="dropdown-menu text-small menubar-dropdown">
                  <li className="dropdown-item" onClick={() => navigate("/myorders")}>
                    Orders
                  </li>
                  <li className="dropdown-item" onClick={logout}>
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Menubar;
