const express = require("express");
const { getCart, addItem, updateItem, removeItem } = require("../controllers/cartController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", getCart);
router.post("/:productId", addItem);
router.patch("/:productId", updateItem);
router.delete("/:productId", removeItem);

module.exports = router;
