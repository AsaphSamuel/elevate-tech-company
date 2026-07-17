import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    get,
    set,
    update,
    remove,
    push
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBknhPHD2jXaMMVH4Nq3uJnc8uuiKs37H4",
    authDomain: "elevate-tech-company.firebaseapp.com",
    databaseURL: "https://elevate-tech-company-default-rtdb.firebaseio.com",
    projectId: "elevate-tech-company",
    storageBucket: "elevate-tech-company.firebasestorage.app",
    messagingSenderId: "5988059403",
    appId: "1:5988059403:web:09e916e312b9c47939fa0e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ---------- SESSÃO ----------

function getSession() {
    return JSON.parse(localStorage.getItem("session"));
}

function verifySession() {
    const session = getSession();

    if (!session) {
        window.location.href = "login.html";
        return;
    }

    if (Date.now() > session.expiresAt) {
        localStorage.removeItem("session");
        window.location.href = "login.html";
    }
}

async function loopVerify() {
    await verifySession();
    setTimeout(loopVerify, 10000);
}

loopVerify();

async function getInDatabase(parametro, userId) {
    const userRef = ref(db, `user/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
        const data = snapshot.val();
        return data[parametro];
    }

    return null;
}

async function showUserName() {
    const session = getSession();
    if (!session) return;

    const nome = await getInDatabase("user", session.userId);
    const el = document.querySelector("#username");
    if (el) el.textContent = nome || "";
}

async function loadUserIcon() {
    const session = getSession();
    if (!session) return;

    const imgUrl = await getInDatabase("img", session.userId);
    const userIcon = document.querySelector("#userIcon");
    if (!userIcon) return;

    userIcon.src = imgUrl || "../../sources/images/default-user.png";
    userIcon.onerror = () => {
        userIcon.src = "../../sources/images/default-user.png";
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector("#user-container");
    if (container) {
        container.addEventListener("click", () => {
            window.location.href = "user.html";
        });
    }
});

showUserName();
loadUserIcon();

// ---------- FORMATAÇÃO ----------

function formatBRL(value) {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ---------- TOGGLE DE MÉTODO DE PAGAMENTO ----------

document.getElementById("back-button").addEventListener("click", async () => {
    history.back();
})

// ---------- RESUMO DO PEDIDO (dados reais do carrinho) ----------

let carrinhoAtual = [];   // [{ item, product }]
let totalAtual = 0;

async function carregarResumoPedido() {
    const summaryLoading = document.getElementById("summary-loading");
    const summaryItemsEl = document.getElementById("summary-items");
    const summarySubtotalEl = document.getElementById("summary-subtotal");
    const summaryTotalEl = document.getElementById("summary-total");
    const submitBtn = document.getElementById("submit-btn");

    const session = getSession();
    if (!session) return;

    const userId = session.userId;

    summaryLoading.style.display = "block";
    summaryItemsEl.innerHTML = "";

    const cartRef = ref(db, `carts/${userId}/items`);
    const cartSnapshot = await get(cartRef);

    if (!cartSnapshot.exists()) {
        summaryLoading.style.display = "none";
        summaryItemsEl.innerHTML = '<p class="summary-empty">Seu carrinho está vazio.</p>';
        summarySubtotalEl.textContent = formatBRL(0);
        summaryTotalEl.textContent = formatBRL(0);
        submitBtn.disabled = true;
        submitBtn.textContent = "Carrinho vazio";
        carrinhoAtual = [];
        totalAtual = 0;
        return;
    }

    const itens = cartSnapshot.val();

    const dados = await Promise.all(
        Object.values(itens).map(async (item) => {
            const productSnapshot = await get(ref(db, `products/${item.productId}`));
            if (!productSnapshot.exists()) return null;

            return {
                item,
                product: productSnapshot.val()
            };
        })
    );

    carrinhoAtual = dados.filter(Boolean);

    let total = 0;
    let html = "";

    carrinhoAtual.forEach(({ item, product }) => {
        const subtotal = product.price * item.quantity;
        total += subtotal;

        html += `
      <div class="summary-item">
        <div class="summary-thumb" style="background-image:url('${product.image}')"></div>
        <div class="summary-info">
          <span class="summary-name">${product.name}</span>
          <span class="summary-desc">Template · quantidade ${item.quantity}</span>
        </div>
        <span class="summary-price">${formatBRL(subtotal)}</span>
      </div>
    `;
    });

    totalAtual = total;

    summaryItemsEl.innerHTML = html;
    summarySubtotalEl.textContent = formatBRL(total);
    summaryTotalEl.textContent = formatBRL(total);

    summaryLoading.style.display = "none";

    submitBtn.disabled = false;
    atualizarTextoBotao();
}

function atualizarTextoBotao() {
    const submitBtn = document.getElementById("submit-btn");
    const activeMethod = document.querySelector(".method-btn.active").dataset.method;

    if (carrinhoAtual.length === 0) {
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
    methodButtons.forEach(btn => {
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
    fieldset.querySelectorAll("input").forEach(input => {
        input.required = isRequired;
    });
}

methodButtons.forEach(btn => {
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

const form = document.getElementById("payment-form");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (carrinhoAtual.length === 0) return;
    if (!form.reportValidity()) return;

    const session = getSession();
    const userId = session.userId;
    const activeMethod = document.querySelector(".method-btn.active").dataset.method;

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Processando...";

    const orderItems = carrinhoAtual.map(({ item, product }) => ({
        productId: item.productId,
        name: product.name,
        quantity: item.quantity,
        price: product.price
    }));

    const order = {
        userId,
        items: orderItems,
        total: totalAtual,
        paymentMethod: activeMethod,
        status: activeMethod === "card" ? "pago" : "aguardando_pix",
        createdAt: Date.now()
    };

    try {
        const newOrderRef = push(ref(db, `orders/${userId}`));
        await set(newOrderRef, order);

        // limpa o carrinho após o pedido ser registrado
        await remove(ref(db, `carts/${userId}/items`));

        if (activeMethod === "card") {
            alert("Pagamento com cartão processado com sucesso!");
        } else {
            alert("Pedido registrado! Escaneie o QR Code Pix para concluir o pagamento.");
        }

        window.location.href = "store.html";

    } catch (error) {
        console.error(error);
        // alert("Não foi possível concluir o pedido. Tente novamente.");
        submitBtn.disabled = false;
        atualizarTextoBotao();
    }
});

// ---------- INICIALIZAÇÃO ----------

setMethod("card");
carregarResumoPedido();