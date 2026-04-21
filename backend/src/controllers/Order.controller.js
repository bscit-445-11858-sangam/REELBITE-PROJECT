const Order = require("../models/Order");
const Cart = require("../models/cart");

const placeOrder = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart empty" });
  }

  const order = await Order.create({
    user: req.user._id,
    items: cart.items
  });

  cart.items = [];
  await cart.save();

  res.json(order);
};

const getOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.food");

  res.json(orders);
};

module.exports = { placeOrder, getOrders };