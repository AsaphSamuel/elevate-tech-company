const express = require("express");
const { getMe, updateMe } = require("../controllers/userController");
const { requireAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/me", getMe);
router.patch("/me", updateMe);

module.exports = router;
