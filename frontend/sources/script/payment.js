import api from "./api.js";
import { startSessionWatcher, loadUserHeader, wireAccountMenu } from "./session.js";

// ---------- SESSÃO E USUÁRIO ----------
startSessionWatcher();
loadUserHeader();

document.addEventListener("DOMContentLoaded", () => {
  wireAccountMenu();
});

document.getElementById("back-button")?.addEventListener("click", () => history.back());

// ---------- FORMATAÇÃO ----------

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ---------- RESUMO DO PEDIDO (carrinho real vindo do backend) ----------

let carrinhoVazio = true;
let totalAtual = 0;

async function carregarResumoPedido() {
  const summaryLoading = document.getElementById("summary-loading");
  const summaryItemsEl = document.getElementById("summary-items");
  const summarySubtotalEl = document.getElementById("summary-subtotal");
  const summaryTotalEl = document.getElementById("summary-total");
  const submitBtn = document.getElementById("submit-btn");

  summaryLoading.style.display = "block";
  summaryItemsEl.innerHTML = "";

  try {
    const cart = await api.cart.get();

    if (cart.items.length === 0) {
      summaryItemsEl.innerHTML = '<p class="summary-empty">Seu carrinho está vazio.</p>';
      summarySubtotalEl.textContent = formatBRL(0);
      summaryTotalEl.textContent = formatBRL(0);
      submitBtn.disabled = true;
      submitBtn.textContent = "Carrinho vazio";
      carrinhoVazio = true;
      totalAtual = 0;
      return;
    }

    carrinhoVazio = false;
    totalAtual = cart.total;

    summaryItemsEl.innerHTML = cart.items
      .map(
        (item) => `
        <div class="summary-item">
          <div class="summary-thumb" style="background-image:url('../sources/images/${item.image}')"></div>
          <div class="summary-info">
            <span class="summary-name">${item.name}</span>
            <span class="summary-desc">Template · quantidade ${item.quantity}</span>
          </div>
          <span class="summary-price">${formatBRL(item.subtotal)}</span>
        </div>
      `
      )
      .join("");

    summarySubtotalEl.textContent = formatBRL(cart.total);
    summaryTotalEl.textContent = formatBRL(cart.total);

    submitBtn.disabled = false;
    atualizarTextoBotao();
  } catch (error) {
    console.error("Erro ao carregar o carrinho:", error);
    summaryItemsEl.innerHTML = '<p class="summary-empty">Não foi possível carregar seu carrinho.</p>';
  } finally {
    summaryLoading.style.display = "none";
  }
}

function atualizarTextoBotao() {
  const submitBtn = document.getElementById("submit-btn");
  const activeMethod = document.querySelector(".method-btn.active").dataset.method;

  if (carrinhoVazio) {
    submitBtn.textContent = "Carrinho vazio";
    return;
  }

  submitBtn.textContent = activeMethod === "card"
    ? `Pagar ${formatBRL(totalAtual)}`
    : `Gerar Pix de ${formatBRL(totalAtual)}`;
}

// ---------- TOGGLE DE MÉTODO DE PAGAMENTO ----------

const methodButtons = document.querySelectorAll(".method-btn");
const fieldsCard = document.getElementById("fields-card");
const fieldsPix = document.getElementById("fields-pix");

function setMethod(method) {
  methodButtons.forEach((btn) => {
    const isActive = btn.dataset.method === method;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive);
  });

  if (method === "card") {
    fieldsCard.hidden = false;
    fieldsCard.style.display = "flex";
    fieldsPix.hidden = true;
    fieldsPix.style.display = "none";
    setRequired(fieldsCard, true);
    setRequired(fieldsPix, false);
  } else {
    fieldsCard.hidden = true;
    fieldsCard.style.display = "none";
    fieldsPix.hidden = false;
    fieldsPix.style.display = "flex";
    setRequired(fieldsCard, false);
    setRequired(fieldsPix, true);
  }

  atualizarTextoBotao();
}

function setRequired(fieldset, isRequired) {
  fieldset.querySelectorAll("input").forEach((input) => {
    input.required = isRequired;
  });
}

methodButtons.forEach((btn) => {
  btn.addEventListener("click", () => setMethod(btn.dataset.method));
});

// ---------- MÁSCARAS DE INPUT ----------

const cardNumber = document.getElementById("card-number");
cardNumber.addEventListener("input", () => {
  let digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
  cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
});

const cardExpiry = document.getElementById("card-expiry");
cardExpiry.addEventListener("input", () => {
  let digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
  cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
});

const cardCvc = document.getElementById("card-cvc");
cardCvc.addEventListener("input", () => {
  cardCvc.value = cardCvc.value.replace(/\D/g, "").slice(0, 4);
});

function maskCPF(value) {
  let digits = value.replace(/\D/g, "").slice(0, 11);
  digits = digits.replace(/(\d{3})(\d)/, "$1.$2");
  digits = digits.replace(/(\d{3})(\d)/, "$1.$2");
  digits = digits.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return digits;
}

document.getElementById("card-cpf").addEventListener("input", (e) => {
  e.target.value = maskCPF(e.target.value);
});
document.getElementById("pix-cpf").addEventListener("input", (e) => {
  e.target.value = maskCPF(e.target.value);
});

// ---------- FINALIZAÇÃO DO PEDIDO ----------
// O total, os itens e os preços são recalculados no backend a partir do
// carrinho salvo — o que o front-end manda aqui nunca é usado para definir
// quanto o cliente vai pagar.

const form = document.getElementById("payment-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (carrinhoVazio) return;
  if (!form.reportValidity()) return;

  const activeMethod = document.querySelector(".method-btn.active").dataset.method;
  const submitBtn = document.getElementById("submit-btn");

  submitBtn.disabled = true;
  submitBtn.textContent = "Processando...";

  const payload = { paymentMethod: activeMethod };

  if (activeMethod === "card") {
    payload.cardNumber = cardNumber.value;
    payload.cardHolderName = document.getElementById("card-name").value.trim();
    payload.cpf = document.getElementById("card-cpf").value;
    payload.billingAddress = document.getElementById("billing-address").value.trim();
  } else {
    payload.cpf = document.getElementById("pix-cpf").value;
  }

  try {
    const result = await api.orders.checkout(payload);

    if (result.status === "pago") {
      alert("Pagamento com cartão processado com sucesso!");
    } else {
      alert("Pedido registrado! Escaneie o QR Code Pix para concluir o pagamento.");
    }

    window.location.href = "store.html";
  } catch (error) {
    console.error(error);
    alert(error.message || "Não foi possível concluir o pedido. Tente novamente.");
    submitBtn.disabled = false;
    atualizarTextoBotao();
  }
});

// ---------- INICIALIZAÇÃO ----------

setMethod("card");
carregarResumoPedido();
