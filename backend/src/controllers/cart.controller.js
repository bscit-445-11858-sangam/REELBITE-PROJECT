const Cart = require("../models/cart");

const addToCart = async (req, res) => {
  const { foodId } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const index = cart.items.findIndex(
    (item) => item.food.toString() === foodId
  );

  if (index > -1) {
    cart.items[index].quantity += 1;
  } else {
    cart.items.push({ food: foodId, quantity: 1 });
  }

  await cart.save();
  res.json(cart);
};

module.exports = { addToCart };