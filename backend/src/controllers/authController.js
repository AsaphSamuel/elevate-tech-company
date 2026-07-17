const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../config/firebaseAdmin");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");
const { COOKIE_NAME } = require("../middlewares/authMiddleware");

const DAY = 24 * 60 * 60 * 1000;

async function findUserByField(field, value) {
  const snapshot = await db
    .ref("user")
    .orderByChild(field)
    .equalTo(value)
    .get();

  if (!snapshot.exists()) return null;

  const data = snapshot.val();
  const userId = Object.keys(data)[0];
  return { userId, ...data[userId] };
}

function signToken(userId, remember) {
  const expiresIn = remember
    ? process.env.JWT_EXPIRES_IN_LONG || "30d"
    : process.env.JWT_EXPIRES_IN_SHORT || "1d";

  return {
    token: jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn }),
    maxAge: remember ? 30 * DAY : DAY
  };
}

function setSessionCookie(res, userId, remember) {
  const { token, maxAge } = signToken(userId, remember);

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge
  });
}

const signup = asyncHandler(async (req, res) => {
  const username = (req.body.username || "").trim().toLowerCase();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!username || !email || !password) {
    throw httpError(400, "Preencha usuário, e-mail e senha.");
  }

  if (password.length < 6) {
    throw httpError(400, "A senha precisa ter pelo menos 6 caracteres.");
  }

  const existingByName = await findUserByField("user", username);
  if (existingByName) throw httpError(409, `Já existe um usuário com o nome ${username}.`);

  const existingByEmail = await findUserByField("email", email);
  if (existingByEmail) throw httpError(409, "Já existe um usuário com este e-mail.");

  const passwordHash = await bcrypt.hash(password, 10);

  const newUserRef = db.ref("user").push();
  await newUserRef.set({
    user: username,
    email,
    pass: passwordHash,
    perm: false
  });

  res.status(201).json({ message: "Usuário cadastrado com sucesso." });
});

const login = asyncHandler(async (req, res) => {
  const identifier = (req.body.identifier || "").trim().toLowerCase();
  const password = req.body.password || "";
  const remember = Boolean(req.body.remember);

  if (!identifier || !password) {
    throw httpError(400, "Informe usuário/e-mail e senha.");
  }

  const user =
    (await findUserByField("user", identifier)) ||
    (await findUserByField("email", identifier));

  if (!user) throw httpError(404, "Usuário não encontrado.");

  const storedPass = user.pass || "";
  const looksHashed = storedPass.startsWith("$2a$") || storedPass.startsWith("$2b$");

  let passwordMatches;

  if (looksHashed) {
    passwordMatches = await bcrypt.compare(password, storedPass);
  } else {
    // Conta antiga (senha ainda em texto puro, de antes desta atualização).
    // Confere o valor direto e, se bater, migra para hash automaticamente.
    passwordMatches = password === storedPass;

    if (passwordMatches) {
      const newHash = await bcrypt.hash(password, 10);
      await db.ref(`user/${user.userId}/pass`).set(newHash);
    }
  }

  if (!passwordMatches) throw httpError(401, "Senha incorreta.");

  setSessionCookie(res, user.userId, remember);

  res.json({ message: "Login realizado com sucesso." });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "Sessão encerrada." });
});

const session = asyncHandler(async (req, res) => {
  // req.userId já foi validado pelo middleware requireAuth
  res.json({ userId: req.userId });
});

module.exports = { signup, login, logout, session };
