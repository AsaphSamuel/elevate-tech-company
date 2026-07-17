const { db } = require("../config/firebaseAdmin");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

const getMe = asyncHandler(async (req, res) => {
  const snapshot = await db.ref(`user/${req.userId}`).get();

  if (!snapshot.exists()) throw httpError(404, "Usuário não encontrado.");

  const { user, email, img, perm } = snapshot.val();

  res.json({ username: user, email, img: img || null, perm: Boolean(perm) });
});

const updateMe = asyncHandler(async (req, res) => {
  const updates = {};

  if (typeof req.body.username === "string" && req.body.username.trim()) {
    updates.user = req.body.username.trim();
  }

  if (typeof req.body.img === "string") {
    // string vazia = remover foto (volta para o avatar padrão no front-end)
    updates.img = req.body.img.trim();
  }

  if (Object.keys(updates).length === 0) {
    throw httpError(400, "Nada para atualizar.");
  }

  await db.ref(`user/${req.userId}`).update(updates);

  res.json({ message: "Perfil atualizado." });
});

module.exports = { getMe, updateMe };
