// Ponto único de comunicação com o backend.
// Nenhum outro arquivo do front-end deve falar com o Firebase diretamente —
// isso é o que garante que as credenciais e as regras de negócio (preço,
// total, validação de sessão) fiquem só no servidor.

const API_BASE_URL =
  ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? `http://${window.location.hostname}:4000/api` // acompanha o host que a página está usando
    : "/api"; // troque para a URL pública do seu backend em produção

async function request(path, { method = "GET", body } = {}) {
  let res;

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include", // envia/recebe o cookie httpOnly de sessão
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (networkError) {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }

  if (!res.ok) {
    const error = new Error((data && data.message) || "Erro inesperado. Tente novamente.");
    error.status = res.status;
    throw error;
  }

  return data;
}

const api = {
  auth: {
    signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
    login: (payload) => request("/auth/login", { method: "POST", body: payload }),
    logout: () => request("/auth/logout", { method: "POST" }),
    session: () => request("/auth/session")
  },
  user: {
    getMe: () => request("/user/me"),
    updateMe: (payload) => request("/user/me", { method: "PATCH", body: payload })
  },
  store: {
    getProducts: () => request("/store/products")
  },
  cart: {
    get: () => request("/cart"),
    add: (productId) => request(`/cart/${productId}`, { method: "POST" }),
    increase: (productId) => request(`/cart/${productId}`, { method: "PATCH", body: { action: "increase" } }),
    decrease: (productId) => request(`/cart/${productId}`, { method: "PATCH", body: { action: "decrease" } }),
    remove: (productId) => request(`/cart/${productId}`, { method: "DELETE" })
  },
  orders: {
    checkout: (payload) => request("/orders", { method: "POST", body: payload })
  }
};

export default api;