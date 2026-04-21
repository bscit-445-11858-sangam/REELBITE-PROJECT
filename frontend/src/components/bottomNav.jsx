import React, { useContext, useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/bottom-nav.css";
import { CartContext } from "../context/CartContext";
import { hasTrackableOrder } from "../utils/orderStorage";

const BottomNav = () => {
  const { getTotalItems } = useContext(CartContext);
  const cartCount = getTotalItems();
  const [showTrackFab, setShowTrackFab] = useState(() =>
    hasTrackableOrder()
  );

  useEffect(() => {
    const sync = () => setShowTrackFab(hasTrackableOrder());
    window.addEventListener("reelbite-orders-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("reelbite-orders-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Bottom">
      <div className="bottom-nav__inner">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? "is-active" : ""}`
          }
        >
          <span className="bottom-nav__icon" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
            </svg>
          </span>
          <span className="bottom-nav__label">Home</span>
        </NavLink>

        <NavLink
          to="/saved"
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? "is-active" : ""}`
          }
        >
          <span className="bottom-nav__icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
            </svg>
          </span>
          <span className="bottom-nav__label">Saved</span>
        </NavLink>

        <div className="bottom-nav__cart-with-fab">
          {showTrackFab && (
            <Link
              to="/order-tracking"
              className="bottom-nav__track-fab"
              aria-label="Track order"
              title="Track order"
            >
              <span className="bottom-nav__track-fab-inner" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v6l4 2" />
                </svg>
              </span>
            </Link>
          )}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `bottom-nav__item ${isActive ? "is-active" : ""}`
            }
          >
            <span className="bottom-nav__icon" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </span>
            <span className="bottom-nav__label">Cart</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
