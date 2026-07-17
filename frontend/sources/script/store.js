import api from "./api.js";
import { startSessionWatcher, loadUserHeader, wireAccountMenu } from "./session.js";

// ---------- SESSÃO E USUÁRIO ----------
startSessionWatcher();
loadUserHeader();

document.addEventListener("DOMContentLoaded", () => {
  wireAccountMenu();
});

// ---------- NAVBAR (igual às outras páginas) ----------
let ignoreScroll = false;

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;

  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

const links = document.querySelectorAll(".navbar-text");

links.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const targetId = link.dataset.target;
    const currentPage = window.location.pathname.split("/").pop();

    if ((targetId === "home" || targetId === "about" || targetId === "contact") && currentPage !== "index.html") {
      window.location.href = `index.html#${targetId}`;
      return;
    }

    if (targetId === "store" && currentPage !== "store.html") {
      window.location.href = "store.html";
      return;
    }

    links.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");

    ignoreScroll = true;
    scrollToSection(targetId);

    setTimeout(() => {
      ignoreScroll = false;
    }, 800);
  });
});

window.addEventListener("load", () => {
  const hash = window.location.hash.replace("#", "");
  if (hash) scrollToSection(hash);
});

const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
  if (ignoreScroll) return;

  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    if (pageYOffset >= sectionTop - sectionHeight / 3) {
      current = section.getAttribute("id");
    }
  });

  links.forEach((link) => {
    link.classList.remove("active");
    if (link.dataset.target === current) link.classList.add("active");
  });
});

document.querySelectorAll(".active").forEach((el) => el.classList.remove("active"));

const storeNavItem = document.querySelector('ul[data-target="store"]');
if (storeNavItem) {
  requestAnimationFrame(() => storeNavItem.classList.add("active"));
}

// ---------- FILTROS DE CATEGORIA (Todos / E-commerce / Landing Pages / Portfólios) ----------
const filterButtons = document.querySelectorAll(".filters button[data-target]");
const categorySections = document.querySelectorAll("section.category[id]");
const HEADER_OFFSET = 160; // header fixo tem ~142px de altura

function scrollToCategory(id) {
  const section = document.getElementById(id);
  if (!section) return;

  const top = section.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active-nav2"));
    button.classList.add("active-nav2");

    ignoreScroll = true;
    scrollToCategory(button.dataset.target);

    setTimeout(() => {
      ignoreScroll = false;
    }, 800);
  });
});

window.addEventListener("scroll", () => {
  if (ignoreScroll || categorySections.length === 0) return;

  let current = categorySections[0].id;

  categorySections.forEach((section) => {
    if (window.pageYOffset >= section.offsetTop - HEADER_OFFSET - 40) {
      current = section.id;
    }
  });

  filterButtons.forEach((btn) => {
    btn.classList.toggle("active-nav2", btn.dataset.target === current);
  });
});

// ---------- ABRIR/FECHAR CARRINHO ----------
const cartPanel = document.querySelector("#cart");
const toggleCartBtn = document.querySelector("#toggleCart");
const hideCartBtn = document.querySelector("#hideCart");
const homeSection = document.querySelector("#home");

function toggleCart() {
  cartPanel.classList.toggle("active");
}

toggleCartBtn?.addEventListener("click", toggleCart);
hideCartBtn?.addEventListener("click", toggleCart);

homeSection?.addEventListener("click", () => {
  if (cartPanel.classList.contains("active")) {
    cartPanel.classList.remove("active");
  }
});

// ---------- CARRINHO (via backend) ----------

const loadingEl = document.querySelector("#loading");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const finishBuyEl = document.getElementById("finish-buy");
const finishPriceEl = document.getElementById("finish-price");
const cartCounterEl = document.querySelector("#cart-counter");

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Trava simples para impedir que dois cliques rápidos (ex: + + + no mesmo item)
// disparem requisições sobrepostas e deixem o carrinho com estado inconsistente.
let isBusy = false;

function setBusy(busy) {
  isBusy = busy;
  cartItemsEl.querySelectorAll("button").forEach((btn) => (btn.disabled = busy));
}

// Mostra o spinner e ESCONDE itens, total e botão de finalizar enquanto carrega.
function showLoadingState() {
  loadingEl.classList.add("loading");
  cartItemsEl.style.display = "none";
  cartTotalEl.style.display = "none";
  finishBuyEl.style.display = "none";
}

// Só tira o spinner e revela a lista de itens — total e botão de finalizar
// ficam a cargo do renderCart(), que sabe se o carrinho tem produtos ou não.
function hideLoadingState() {
  loadingEl.classList.remove("loading");
  cartItemsEl.style.display = "block";
}

function renderCart(cart) {
  if (cart.items.length === 0) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Carrinho vazio.</p>';
    cartTotalEl.innerHTML = "";
    cartTotalEl.style.display = "none";
    finishPriceEl.textContent = "";
    finishBuyEl.style.display = "none";
    return;
  }

  cartItemsEl.innerHTML = cart.items
    .map(
      (item) => `
      <div class="cart-item">
        <img src="../sources/images/${item.image}" alt="${item.name}">

        <div class="cart-info">
          <h4>${item.name}</h4>

          <div class="quantity-control">
            <button data-action="decrease" data-product="${item.productId}">-</button>
            <span>${item.quantity}</span>
            <button data-action="increase" data-product="${item.productId}">+</button>
          </div>

          <p>${formatBRL(item.subtotal)}</p>

          <button data-action="remove" data-product="${item.productId}" class="cart-remove">
            Remover
          </button>
        </div>
      </div>
    `
    )
    .join("");

  cartTotalEl.innerHTML = `
    <p class="cart-total-title">Total</p>
    <p class="cart-total-price">${formatBRL(cart.total)}</p>
  `;
  cartTotalEl.style.display = "flex";

  finishPriceEl.textContent = formatBRL(cart.total);
  finishBuyEl.style.display = "flex";
}

function updateCartCounter(cart) {
  cartCounterEl.innerHTML = cart.count > 0 ? `<p>${cart.count}</p>` : "";
}

async function carregarCarrinho() {
  showLoadingState();

  try {
    const cart = await api.cart.get();
    renderCart(cart);
    updateCartCounter(cart);
  } catch (error) {
    cartItemsEl.innerHTML = '<p class="cart-empty">Não foi possível carregar seu carrinho. Tente novamente.</p>';
    cartTotalEl.innerHTML = "";
    finishBuyEl.style.display = "none";
    console.error(error);
  } finally {
    hideLoadingState();
  }
}

carregarCarrinho();

// Adiciona ao carrinho a partir dos cards da loja
document.querySelectorAll(".buy-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (isBusy) return;

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Adicionando...";

    try {
      const cart = await api.cart.add(btn.dataset.product);
      renderCart(cart);
      updateCartCounter(cart);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
});

// Delegação de eventos: +, -, Remover dentro do carrinho
cartItemsEl.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || isBusy) return;

  const { action, product } = button.dataset;

  setBusy(true);

  try {
    let cart;

    if (action === "increase") cart = await api.cart.increase(product);
    else if (action === "decrease") cart = await api.cart.decrease(product);
    else if (action === "remove") cart = await api.cart.remove(product);

    if (cart) {
      renderCart(cart);
      updateCartCounter(cart);
    }
  } catch (error) {
    console.error("Erro ao atualizar o carrinho:", error);
  } finally {
    setBusy(false);
  }
});

// ---------- FINALIZAR PAGAMENTO ----------
document.getElementById("finish-buy").addEventListener("click", () => {
  window.location.href = "payment.html";
});