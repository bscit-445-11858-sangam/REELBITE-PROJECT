const express = require("express");
const { placeOrder, getOrders } = require("../controllers/Order.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware.authUserMiddleware, placeOrder);
router.get("/", authMiddleware.authUserMiddleware, getOrders);

module.exports = router;