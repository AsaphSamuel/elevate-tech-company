import api from "./api.js";

// Confirma com o backend se a sessão (cookie httpOnly) ainda é válida.
// Diferente da versão antiga, o front-end não decide mais isso sozinho —
// só o servidor sabe se o token expirou ou foi revogado.
export async function verifySession({ redirectTo = "login.html" } = {}) {
  try {
    await api.auth.session();
    return true;
  } catch (error) {
    window.location.href = redirectTo;
    return false;
  }
}

// Revalida a sessão periodicamente enquanto a página estiver aberta.
export function startSessionWatcher({ redirectTo = "login.html", intervalMs = 60000 } = {}) {
  verifySession({ redirectTo });
  setInterval(() => verifySession({ redirectTo }), intervalMs);
}

// Preenche nome e avatar do usuário no cabeçalho, quando esses elementos existem na página.
export async function loadUserHeader() {
  const usernameEl = document.querySelector("#username");
  const iconEl = document.querySelector("#userIcon");

  if (!usernameEl && !iconEl) return;

  try {
    const me = await api.user.getMe();

    if (usernameEl) usernameEl.textContent = me.username;

    if (iconEl) {
      iconEl.src = me.img || "../sources/images/default-user.png";
      iconEl.onerror = () => {
        iconEl.src = "../sources/images/default-user.png";
      };
    }
  } catch (error) {
    console.error("Não foi possível carregar os dados do usuário:", error);
  }
}

// Liga os cliques do menu (ir para "Minha conta" e "Log out") nas páginas que os têm.
export function wireAccountMenu() {
  document.querySelectorAll("#user-container, #my-account").forEach((el) => {
    el.addEventListener("click", () => {
      window.location.href = "user.html";
    });
  });

  const logout = document.querySelector("#logout");

  if (logout) {
    logout.addEventListener("click", async (event) => {
      event.preventDefault();

      try {
        await api.auth.logout();
      } catch (error) {
        console.error("Erro ao encerrar sessão:", error);
      }

      window.location.href = "index.html";
    });
  }
}
