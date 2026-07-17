const { db } = require("../config/firebaseAdmin");
const asyncHandler = require("../utils/asyncHandler");

const getProducts = asyncHandler(async (req, res) => {
  const snapshot = await db.ref("products").get();

  if (!snapshot.exists()) {
    return res.json([]);
  }

  const data = snapshot.val();

  const products = Object.entries(data).map(([id, product]) => ({
    id: Number(id),
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.image
  }));

  res.json(products);
});

module.exports = { getProducts };
