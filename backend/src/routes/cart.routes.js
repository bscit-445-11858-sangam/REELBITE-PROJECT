const express = require("express");
const { addToCart } = require("../controllers/cart.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/add", authMiddleware.authUserMiddleware, addToCart);

module.exports = router;