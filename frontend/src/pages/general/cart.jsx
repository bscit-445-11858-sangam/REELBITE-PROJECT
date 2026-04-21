import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../../styles/cart.css";
import { computeOrderTotals } from "../../utils/price";
import {
  appendOrder,
  generateOrderId,
} from "../../utils/orderStorage";

const DELIVERY_FEE = 50;

const Cart = () => {
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    getTotalPrice,
    clearCart,
  } = useContext(CartContext);

  const navigate = useNavigate();
  const subtotal = getTotalPrice();
  const { tax, delivery, total } = computeOrderTotals(subtotal, DELIVERY_FEE);
  const items = cart;
  const [showPayment, setShowPayment] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [upiId, setUpiId] = useState("");

  const itemKey = (item) => item.id ?? item._id;

  const handleConfirmPayment = () => {
    if (cart.length === 0) return;
    const snapSubtotal = getTotalPrice();
    const totals = computeOrderTotals(snapSubtotal, DELIVERY_FEE);
    const order = {
      orderId: generateOrderId(),
      status: "preparing",
      items: cart.map((i) => ({
        id: i.id ?? i._id,
        name: i.name,
        qty: i.qty,
        price: i.price,
        video: i.video,
        image: i.image,
        description: i.description,
      })),
      ...totals,
      createdAt: new Date().toISOString(),
    };
    appendOrder(order);
    clearCart();
    setShowPayment(false);
    setSelectedMethod("");
    setUpiId("");
    setShowOrderSuccess(true);
  };

  const handleTrackOrder = () => {
    setShowOrderSuccess(false);
    navigate("/order-tracking");
  };

  // ✅ EMPTY CART (no success modal)
  if (cart.length === 0 && !showOrderSuccess) {
    return (
      <div className="empty-cart-page">
        <div className="empty-cart-card">
          <div className="brand-title">ReelBite</div>
          <div className="brand-sub">Scroll. Crave. Order.</div>

          <div className="empty-title">Your Cart is Empty 😕</div>
          <div className="empty-sub">
            Add some delicious food items to your cart 🍔
          </div>

          <button onClick={() => navigate("/")} className="home-btn">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page cart-container cart-scroll-safe">
      <div className="cart-header">
        <h2 className="cart-title">Shopping Cart</h2>
      </div>

      {/* ✅ CART ITEMS */}
      <div className="cart-items">
        {items?.length > 0 &&
          items.map((item, index) => (
            <div key={itemKey(item) ?? index} className="cart-item">
              <div className="cart-item-media">
                <div className="item-image">
                  {item.video ? (
                    <video
                      src={item.video}
                      className="cart-media"
                      autoPlay
                      muted
                      loop
                    />
                  ) : (
                    <img
                      src={item.image?.url || item.image || "/default.jpg"}
                      className="cart-media"
                      alt={item.name}
                    />
                  )}
                </div>
                <div className="cart-item-details">
                  <div className="item-name">{item.name}</div>
                  <div className="item-price">₹{Number(item.price || 0).toFixed(2)}</div>
                  <div className="item-desc">{item.description}</div>
                  <div className="qty-container">
                    <button
                      className="qty-btn"
                      onClick={() => decreaseQty(itemKey(item))}
                    >
                      -
                    </button>
                    <span className="qty-count">{item.qty}</span>
                    <button
                      className="qty-btn"
                      onClick={() => increaseQty(itemKey(item))}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* ✅ QTY & REMOVE */}
              <div className="item-controls">
                <div className="item-total">
                  ₹{(Number(item.price || 0) * item.qty).toFixed(2)}
                </div>

                <button
                  onClick={() => removeFromCart(itemKey(item))}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
      </div>

      {items?.length > 0 && (
        <>
          <div className="savings-section">
            <div className="savings-item">
              <div>🏷 Apply Coupon</div>
              <div>›</div>
            </div>
            <div className="savings-item">
              <div>₹30 extra off above coupons</div>
              <div className="applied">✔ Applied</div>
            </div>
            <div className="savings-item">
              <div>₹50 OFF on orders above ₹199</div>
              <div className="available">Apply</div>
            </div>
            <div className="savings-item">
              <div>Free Delivery Coupon</div>
              <div className="available">Apply</div>
            </div>
          </div>

          {/* ✅ CART SUMMARY */}
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery:</span>
              <span>₹{delivery.toFixed(2)}</span>
            </div>
            <div className="summary-row tax">
              <span>Tax (18%):</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* ✅ ACTION BUTTONS */}
          <div className="cart-actions">
            <button onClick={() => navigate("/")} className="btn-continue">
              Continue Shopping
            </button>
            <button onClick={() => clearCart()} className="btn-clear">
              Clear Cart
            </button>
            <button
              onClick={() => navigate("/checkout")}
              className="btn-checkout"
            >
              Proceed to Checkout
            </button>
          </div>

          <div className="payment-btn-container">
            <button className="payment-btn" onClick={() => setShowPayment(true)}>
              Proceed to Payment 💳
            </button>
          </div>
        </>
      )}

      {showPayment && (
        <div className="popup-overlay" onClick={() => setShowPayment(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h3>Select Payment Method</h3>

            <div
              className="payment-option"
              onClick={() => setSelectedMethod("gpay")}
            >
              📱 Google Pay
            </div>

            <div
              className="payment-option"
              onClick={() => setSelectedMethod("paytm")}
            >
              💰 Paytm
            </div>

            <div
              className="payment-option"
              onClick={() => setSelectedMethod("upi")}
            >
              🔢 Enter UPI ID
            </div>

            {selectedMethod === "upi" && (
              <input
                type="text"
                placeholder="Enter UPI ID"
                className="checkout-input"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            )}

            <div
              className="payment-option"
              onClick={() => setSelectedMethod("qr")}
            >
              📷 Scan QR Code
            </div>

            {selectedMethod === "qr" && (
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay"
                alt="QR"
                style={{ margin: "10px auto", display: "block" }}
              />
            )}

            <div
              className="payment-option"
              onClick={() => setSelectedMethod("cod")}
            >
              🚚 Cash on Delivery
            </div>

            <button
              className="place-order-btn"
              onClick={handleConfirmPayment}
            >
              Confirm Payment ✅
            </button>
          </div>
        </div>
      )}

      {showOrderSuccess && (
        <div
          className="popup-overlay order-success-overlay"
          onClick={() => setShowOrderSuccess(false)}
        >
          <div
            className="popup-box order-success-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="order-success-title">Order Placed Successfully 🎉</h3>
            <p className="order-success-text">
              Your order is being prepared. Track it anytime from the home bar.
            </p>
            <button
              type="button"
              className="place-order-btn order-success-track"
              onClick={handleTrackOrder}
            >
              Track Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
