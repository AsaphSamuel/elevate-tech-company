const express = require("express");
const rateLimit = require("express-rate-limit");
const { signup, login, logout, session } = require("../controllers/authController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

// Limita tentativas de login/cadastro para dificultar força bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }
});

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/session", requireAuth, session);

module.exports = router;
