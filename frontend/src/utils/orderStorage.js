const ORDERS_KEY = "reelbite_orders";
const ACTIVE_ORDER_KEY = "reelbite_active_order_id";

export function generateOrderId() {
  return `RB-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getOrderById(orderId) {
  return getOrders().find((o) => o.orderId === orderId) ?? null;
}

export function appendOrder(order) {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  if (order.orderId) {
    localStorage.setItem(ACTIVE_ORDER_KEY, order.orderId);
  }
  notifyOrderChanged();
}

export function updateOrder(orderId, patch) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.orderId === orderId);
  if (idx < 0) return;
  orders[idx] = { ...orders[idx], ...patch };
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  notifyOrderChanged();
}

export function getActiveOrderId() {
  return localStorage.getItem(ACTIVE_ORDER_KEY);
}

export function setActiveOrderId(orderId) {
  if (orderId) localStorage.setItem(ACTIVE_ORDER_KEY, orderId);
  else localStorage.removeItem(ACTIVE_ORDER_KEY);
  notifyOrderChanged();
}

export function hasTrackableOrder() {
  const id = getActiveOrderId();
  if (!id) return false;
  const order = getOrderById(id);
  if (!order) return false;
  return order.status !== "delivered";
}

export function notifyOrderChanged() {
  window.dispatchEvent(new CustomEvent("reelbite-orders-changed"));
}
