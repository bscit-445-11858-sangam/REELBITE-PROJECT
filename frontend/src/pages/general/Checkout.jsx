import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/checkout.css";
import { CartContext } from "../../context/CartContext";
import { computeOrderTotals } from "../../utils/price";
import {
  appendOrder,
  generateOrderId,
} from "../../utils/orderStorage";

const DELIVERY_FEE = 50;

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useContext(CartContext);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");

  const subtotal = getTotalPrice();
  const { tax, delivery, total } = computeOrderTotals(subtotal, DELIVERY_FEE);

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const totals = computeOrderTotals(getTotalPrice(), DELIVERY_FEE);
    const order = {
      orderId: generateOrderId(),
      status: "preparing",
      fullName: fullName.trim(),
      address: address.trim(),
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
    navigate("/order-tracking");
  };

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <div className="checkout-title">Delivery Details</div>

        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          className="checkout-input"
        />

        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
          className="checkout-input"
        />

        <div className="order-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (18%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>₹{delivery.toFixed(2)}</span>
          </div>
          <div className="summary-row checkout-total-row">
            <span>Total</span>
            <strong>₹{total.toFixed(2)}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePlaceOrder}
          className="place-order-btn"
          disabled={cart.length === 0}
        >
          Place Order 🚀
        </button>
      </div>
    </div>
  );
};

export default Checkout;
