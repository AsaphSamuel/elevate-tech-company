import api from "./api.js";

async function handleLogin(event) {
  event.preventDefault();

  const identifier = document.querySelector("#user").value.trim().toLowerCase();
  const password = document.querySelector("#pass").value;
  const remember = document.querySelector("#remember").checked;
  const msg = document.querySelector("#lbl-error");
  const submitBtn = document.querySelector("#btn-login");

  msg.innerText = "";

  if (!identifier || !password) {
    msg.innerText = "Preencha usuário e senha.";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Entrando...";

  try {
    await api.auth.login({ identifier, password, remember });
    window.location.href = "index.html";
  } catch (error) {
    msg.innerText = error.message || "Erro ao fazer login.";
    submitBtn.disabled = false;
    submitBtn.textContent = "ENTER";
  }
}

document.querySelector("#loginForm").addEventListener("submit", handleLogin);
