import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  getActiveOrderId,
  getOrderById,
  updateOrder,
} from "../../utils/orderStorage";
import "../../styles/order-tracking.css";

const STEP_MS = 4000;

const STEPS = [
  { id: "placed", label: "Order Placed", emoji: "✅" },
  { id: "preparing", label: "Preparing", emoji: "👨‍🍳" },
  { id: "out", label: "Out for Delivery", emoji: "🛵" },
  { id: "delivered", label: "Delivered", emoji: "📦" },
];

/** Aligns with persisted order.status values */
const STATUS_FOR_INDEX = [
  "placed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

function stepFromStoredStatus(status) {
  const idx = STATUS_FOR_INDEX.indexOf(status);
  return idx >= 0 ? idx : 0;
}

const OrderTracking = () => {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const orderId =
    routeId ||
    searchParams.get("orderId") ||
    getActiveOrderId() ||
    "";

  const order = orderId ? getOrderById(orderId) : null;

  const [activeStep, setActiveStep] = useState(() =>
    order ? stepFromStoredStatus(order.status) : 0
  );

  useEffect(() => {
    if (!orderId) return;
    const o = getOrderById(orderId);
    if (!o) return;
    setActiveStep(stepFromStoredStatus(o.status));
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !getOrderById(orderId)) return;

    if (activeStep >= STEPS.length - 1) {
      const current = getOrderById(orderId);
      if (current && current.status !== "delivered") {
        updateOrder(orderId, { status: "delivered" });
      }
      return undefined;
    }

    const t = window.setTimeout(() => {
      setActiveStep((s) => {
        const next = Math.min(s + 1, STEPS.length - 1);
        updateOrder(orderId, { status: STATUS_FOR_INDEX[next] });
        return next;
      });
    }, STEP_MS);

    return () => window.clearTimeout(t);
  }, [activeStep, orderId]);

  if (!orderId || !order) {
    return (
      <div className="order-tracking-page">
        <div className="order-tracking-card order-tracking-card--empty">
          <p className="order-tracking-empty-text">No active order found.</p>
          <Link to="/" className="order-tracking-home-link">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const progress = ((activeStep + 1) / STEPS.length) * 100;

  return (
    <div className="order-tracking-page">
      <div className="order-tracking-card">
        <header className="order-tracking-header">
          <h1 className="order-tracking-title">Track Order</h1>
          <p className="order-tracking-id">#{order.orderId}</p>
        </header>

        <div
          className="order-tracking-progress-track"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="order-tracking-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="order-tracking-steps">
          {STEPS.map((step, index) => {
            const done = index < activeStep;
            const current = index === activeStep;
            return (
              <li
                key={step.id}
                className={`order-tracking-step ${done ? "is-done" : ""} ${current ? "is-current" : ""}`}
              >
                <span className="order-tracking-step__marker" aria-hidden="true">
                  {done ? "✓" : step.emoji}
                </span>
                <span className="order-tracking-step__label">{step.label}</span>
              </li>
            );
          })}
        </ol>

        <Link to="/" className="order-tracking-home-btn">
          Back to reels
        </Link>
      </div>
    </div>
  );
};

export default OrderTracking;
