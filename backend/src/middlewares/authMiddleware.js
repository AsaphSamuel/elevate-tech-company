const jwt = require("jsonwebtoken");

const COOKIE_NAME = "elevate_session";

function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: "Faça login para continuar." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (error) {
    res.clearCookie(COOKIE_NAME);
    return res.status(401).json({ message: "Sessão expirada. Faça login novamente." });
  }
}

module.exports = { requireAuth, COOKIE_NAME };
