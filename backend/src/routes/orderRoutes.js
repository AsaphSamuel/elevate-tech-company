const express = require("express");
const rateLimit = require("express-rate-limit");
const { createOrder } = require("../controllers/orderController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas tentativas de pagamento. Aguarde um pouco." }
});

router.use(requireAuth);

router.post("/", checkoutLimiter, createOrder);

module.exports = router;
