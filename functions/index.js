const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Payment } = require("mercadopago");

admin.initializeApp();
const db = admin.database();

// A access token NUNCA deve ir para o frontend. Ela fica só aqui, no servidor.
// Configure com: firebase functions:config:set mercadopago.access_token="TEST-xxxxxxxx"
const client = new MercadoPagoConfig({
  accessToken: functions.config().mercadopago.access_token,
});
const paymentClient = new Payment(client);

// ---------- Recalcula o total a partir do carrinho real no banco ----------
// Nunca confie em um valor de "total" enviado pelo cliente: ele pode ser adulterado.
async function calcularTotalDoCarrinho(userId) {
  const cartSnap = await db.ref(`carts/${userId}/items`).once("value");
  if (!cartSnap.exists()) {
    throw new functions.https.HttpsError("failed-precondition", "Carrinho vazio.");
  }

  const itens = cartSnap.val();
  let total = 0;

  for (const item of Object.values(itens)) {
    const prodSnap = await db.ref(`products/${item.productId}`).once("value");
    if (!prodSnap.exists()) continue;
    total += prodSnap.val().price * item.quantity;
  }

  if (total <= 0) {
    throw new functions.https.HttpsError("failed-precondition", "Total inválido.");
  }

  return Number(total.toFixed(2));
}

// ---------- PIX ----------
exports.criarPagamentoPix = functions.https.onCall(async (data, context) => {
  const { userId, email, nome, sobrenome, cpf } = data;
  if (!userId || !email) {
    throw new functions.https.HttpsError("invalid-argument", "Dados do pagador incompletos.");
  }

  const total = await calcularTotalDoCarrinho(userId);

  const result = await paymentClient.create({
    body: {
      transaction_amount: total,
      description: "Pedido Elevate Tech",
      payment_method_id: "pix",
      payer: {
        email,
        first_name: nome,
        last_name: sobrenome,
        identification: {
          type: "CPF",
          number: (cpf || "").replace(/\D/g, ""),
        },
      },
    },
    requestOptions: { idempotencyKey: `${userId}-${Date.now()}` },
  });

  // Grava o pedido como "aguardando_pix" — o status real vem depois, via consultarPagamento
  const orderRef = db.ref(`orders/${userId}`).push();
  await orderRef.set({
    userId,
    paymentId: result.id,
    paymentMethod: "pix",
    total,
    status: "aguardando_pix",
    createdAt: Date.now(),
  });

  return {
    orderId: orderRef.key,
    paymentId: result.id,
    status: result.status,
    qr_code: result.point_of_interaction?.transaction_data?.qr_code,
    qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
  };
});

// ---------- CARTÃO ----------
// O "token" chega aqui já criado pelo SDK do Mercado Pago no navegador.
// O número do cartão em si NUNCA passa pelo seu backend nem pelo seu banco de dados.
exports.criarPagamentoCartao = functions.https.onCall(async (data, context) => {
  const { userId, token, installments, paymentMethodId, issuerId, email, cpf } = data;
  if (!userId || !token || !paymentMethodId) {
    throw new functions.https.HttpsError("invalid-argument", "Dados de cartão incompletos.");
  }

  const total = await calcularTotalDoCarrinho(userId);

  const result = await paymentClient.create({
    body: {
      transaction_amount: total,
      token,
      description: "Pedido Elevate Tech",
      installments: Number(installments) || 1,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email,
        identification: {
          type: "CPF",
          number: (cpf || "").replace(/\D/g, ""),
        },
      },
    },
    requestOptions: { idempotencyKey: `${userId}-${Date.now()}` },
  });

  const aprovado = result.status === "approved";

  const orderRef = db.ref(`orders/${userId}`).push();
  await orderRef.set({
    userId,
    paymentId: result.id,
    paymentMethod: "card",
    total,
    status: aprovado ? "pago" : "recusado",
    statusDetail: result.status_detail,
    createdAt: Date.now(),
  });

  if (aprovado) {
    await db.ref(`carts/${userId}/items`).remove();
  }

  return {
    orderId: orderRef.key,
    paymentId: result.id,
    status: result.status,
    statusDetail: result.status_detail,
  };
});

// ---------- Consulta de status (usada para o polling do Pix) ----------
exports.consultarPagamento = functions.https.onCall(async (data, context) => {
  const { paymentId, userId, orderId } = data;
  if (!paymentId) {
    throw new functions.https.HttpsError("invalid-argument", "paymentId é obrigatório.");
  }

  const result = await paymentClient.get({ id: paymentId });

  // Se o Pix acabou de ser aprovado, atualiza o pedido e limpa o carrinho
  if (result.status === "approved" && userId && orderId) {
    await db.ref(`orders/${userId}/${orderId}`).update({ status: "pago" });
    await db.ref(`carts/${userId}/items`).remove();
  }

  return { status: result.status };
});