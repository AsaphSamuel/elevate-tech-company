// Captura qualquer erro não tratado nas rotas (via asyncHandler) e responde
// de forma padronizada, sem vazar detalhes internos para o cliente.
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  const message = status === 500 ? "Erro interno no servidor." : err.message;

  res.status(status).json({ message });
}

module.exports = errorHandler;
