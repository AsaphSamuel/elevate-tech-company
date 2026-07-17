const express = require("express");
const { getProducts } = require("../controllers/storeController");

const router = express.Router();

router.get("/products", getProducts);

module.exports = router;
