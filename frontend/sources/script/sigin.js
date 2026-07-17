import api from "./api.js";

function setPlaceholderIfEmpty(input, text) {
  if (!input.value.trim()) input.placeholder = text;
}

async function handleSignup(event) {
  event.preventDefault();

  const userInput = document.querySelector("#user");
  const emailInput = document.querySelector("#email");
  const passInput = document.querySelector("#pass");
  const msg = document.querySelector("#lbl-error");
  const submitBtn = document.querySelector("#btn-sigin");

  const username = userInput.value.trim().toLowerCase();
  const email = emailInput.value.trim();
  const password = passInput.value;

  msg.innerText = "";

  setPlaceholderIfEmpty(userInput, "Preencha esse campo!");
  setPlaceholderIfEmpty(emailInput, "Preencha esse campo!");
  setPlaceholderIfEmpty(passInput, "Preencha esse campo!");

  if (!username || !email || !password) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Criando...";

  try {
    await api.auth.signup({ username, email, password });
    window.location.href = "login.html";
  } catch (error) {
    msg.innerText = error.message || "Erro ao tentar cadastrar usuário. Tente novamente.";
    submitBtn.disabled = false;
    submitBtn.textContent = "CREATE";
  }
}

document.querySelector("#registerForm").addEventListener("submit", handleSignup);
