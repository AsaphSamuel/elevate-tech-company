const { db } = require("../config/firebaseAdmin");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");
const { buildCart } = require("./cartController");

// IMPORTANTE: isto é uma simulação de pagamento para fins do projeto.
// Número completo do cartão, CVC e validade NUNCA são salvos — nem aqui,
// nem em lugar nenhum do banco. Em produção, cartão deve ser processado por
// um gateway certificado (Stripe, Mercado Pago, Pagar.me...), que devolve
// apenas um token seguro para o seu backend guardar.
const createOrder = asyncHandler(async (req, res) => {
  const { paymentMethod, cardNumber, cardHolderName, cpf, billingAddress } = req.body;

  if (!["card", "pix"].includes(paymentMethod)) {
    throw httpError(400, "Método de pagamento inválido.");
  }

  const cart = await buildCart(req.userId);

  if (cart.items.length === 0) {
    throw httpError(400, "Seu carrinho está vazio.");
  }

  if (paymentMethod === "card") {
    if (!cardNumber || !cardHolderName || !cpf || !billingAddress) {
      throw httpError(400, "Preencha todos os campos do cartão.");
    }
  } else if (!cpf) {
    throw httpError(400, "Informe o CPF para gerar o Pix.");
  }

  const order = {
    userId: req.userId,
    items: cart.items.map(({ productId, name, unitPrice, quantity, subtotal }) => ({
      productId,
      name,
      unitPrice,
      quantity,
      subtotal
    })),
    total: cart.total, // valor calculado no servidor — nunca confiar no que vem do cliente
    paymentMethod,
    // apenas os últimos 4 dígitos ficam registrados, só para exibição no histórico
    cardLast4: paymentMethod === "card" ? String(cardNumber).replace(/\D/g, "").slice(-4) : null,
    status: paymentMethod === "card" ? "pago" : "aguardando_pix",
    createdAt: Date.now()
  };

  const newOrderRef = db.ref(`orders/${req.userId}`).push();
  await newOrderRef.set(order);

  await db.ref(`carts/${req.userId}/items`).remove();

  res.status(201).json({
    orderId: newOrderRef.key,
    status: order.status,
    total: order.total
  });
});

module.exports = { createOrder };
