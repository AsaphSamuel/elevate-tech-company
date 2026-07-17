const { db } = require("../config/firebaseAdmin");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

// Monta o carrinho completo (itens + subtotal + total) direto do banco,
// buscando o preço de cada produto no servidor — o front-end nunca envia preço.
async function buildCart(userId) {
  const snapshot = await db.ref(`carts/${userId}/items`).get();

  if (!snapshot.exists()) {
    return { items: [], total: 0, count: 0 };
  }

  const rawItems = Object.values(snapshot.val());

  const items = await Promise.all(
    rawItems.map(async (item) => {
      const productSnapshot = await db.ref(`products/${item.productId}`).get();
      if (!productSnapshot.exists()) return null;

      const product = productSnapshot.val();
      const subtotal = product.price * item.quantity;

      return {
        productId: Number(item.productId),
        name: product.name,
        image: product.image,
        unitPrice: product.price,
        quantity: item.quantity,
        subtotal
      };
    })
  );

  const validItems = items.filter(Boolean);
  const total = validItems.reduce((acc, item) => acc + item.subtotal, 0);

  return { items: validItems, total, count: validItems.length };
}

const getCart = asyncHandler(async (req, res) => {
  const cart = await buildCart(req.userId);
  res.json(cart);
});

const addItem = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);

  const productSnapshot = await db.ref(`products/${productId}`).get();
  if (!productSnapshot.exists()) throw httpError(404, "Produto não encontrado.");

  const itemRef = db.ref(`carts/${req.userId}/items/${productId}`);
  const itemSnapshot = await itemRef.get();

  const currentQuantity = itemSnapshot.exists() ? itemSnapshot.val().quantity : 0;

  await itemRef.set({ productId, quantity: currentQuantity + 1 });

  const cart = await buildCart(req.userId);
  res.status(201).json(cart);
});

const updateItem = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);
  const { action } = req.body;

  if (!["increase", "decrease"].includes(action)) {
    throw httpError(400, "Ação inválida.");
  }

  const itemRef = db.ref(`carts/${req.userId}/items/${productId}`);
  const itemSnapshot = await itemRef.get();

  if (!itemSnapshot.exists()) throw httpError(404, "Item não está no carrinho.");

  const currentQuantity = itemSnapshot.val().quantity;

  if (action === "increase") {
    await itemRef.update({ quantity: currentQuantity + 1 });
  } else if (currentQuantity > 1) {
    await itemRef.update({ quantity: currentQuantity - 1 });
  } else {
    await itemRef.remove();
  }

  const cart = await buildCart(req.userId);
  res.json(cart);
});

const removeItem = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);

  await db.ref(`carts/${req.userId}/items/${productId}`).remove();

  const cart = await buildCart(req.userId);
  res.json(cart);
});

module.exports = { getCart, addItem, updateItem, removeItem, buildCart };
