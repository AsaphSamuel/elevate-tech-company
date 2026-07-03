function verifySession() {
  const session = JSON.parse(localStorage.getItem("session"));

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const agora = Date.now();

  if (agora > session.expiresAt) {
    localStorage.removeItem("session");
    window.location.href = "login.html";
  }
}

async function loopVerify() {
  await verifySession();
  setTimeout(loopVerify, 10000);
}

loopVerify();

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  set,
  query,
  orderByChild,
  equalTo,
  get,
  child
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
  const session = JSON.parse(localStorage.getItem("session"));

  const nome = await getInDatabase("user", session.userId);

  document.querySelector("#username").textContent = nome;
}

showUserName();

const session = JSON.parse(localStorage.getItem("session"));

async function loadUserIcon() {
  const imgUrl = await getInDatabase("img", session.userId);

  const userIcon = document.querySelector("#userIcon");

  if (!userIcon) return;

  const finalImg = imgUrl || "../sources/images/default-user.png";

  userIcon.src = finalImg;

  userIcon.onerror = () => {
    userIcon.src = "../sources/images/default-user.png";
  };
}

loadUserIcon();

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#user-container");

  if (container) {
    container.addEventListener("click", () => {
      const session = JSON.parse(localStorage.getItem("session"));

      localStorage.setItem("session", JSON.stringify(session));

      window.location.href = "user.html";
    });
  }
});

//NAVBAR
//SCROLL NAVBAR
let ignoreScroll = false;

function scrollToSection(id) {

  const section = document.getElementById(id);

  if (!section) return;

  section.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

}
const links = document.querySelectorAll('.navbar-text');

links.forEach(link => {
  link.addEventListener('click', (event) => {

    event.preventDefault();

    const targetId = link.dataset.target;
    const currentPage = window.location.pathname.split('/').pop();

    // HOME e ABOUT -> index.html
    if ((targetId === 'home' || targetId === 'about') && currentPage !== 'index.html') {
      window.location.href = `index.html#${targetId}`;
      return;
    }

    // STORE -> store.html
    if (targetId === 'store' && currentPage !== 'store.html') {
      window.location.href = 'store.html';
      return;
    }

    // REMOVE .active DE TODOS
    links.forEach(item => item.classList.remove('active'));

    // ADICIONA .active PARA O CLICADO
    link.classList.add('active');

    console.log('Clicked:', link.textContent);   

    // disable scroll spy temporarily
    ignoreScroll = true;

    scrollToSection(targetId);

    // re-enable after scroll finishes
    setTimeout(() => {
      ignoreScroll = false;
    }, 800); // match your scroll speed
  });
});

window.addEventListener('load', () => {

  const hash = window.location.hash.replace('#', '');

  if (hash) {
    scrollToSection(hash);
  }

});

//CHANGES NAVBAR BY SCROLLPAGE
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {

  if (ignoreScroll) return;

  let current = '';

  sections.forEach(section => {

    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
      current = section.getAttribute('id');
    }

  });

  links.forEach(link => {

    link.classList.remove('active');

    if (link.dataset.target === current) {
      link.classList.add('active');
    }

  });

});

//AUTO PUT .active IN STORE
document.querySelectorAll('.active').forEach(el => {
  el.classList.remove('active');
});

const store = document.querySelector('ul[data-target="store"]');

requestAnimationFrame(() => {
  store.classList.add('active');
});


//DROPDOWN {MY ACCOUNT}
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#my-account");

  if (container) {
    container.addEventListener("click", () => {
      const session = JSON.parse(localStorage.getItem("session"));

      localStorage.setItem("session", JSON.stringify(session));

      window.location.href = "user.html";
    });
  }
});
//DROPDOWN {LOGOUT}
document.querySelector("#logout").addEventListener("click", async () => {
  const session = JSON.parse(localStorage.getItem("session"));

  session.expiresAt = Date.now();

  localStorage.setItem("session", JSON.stringify(session));
  location.href = "index.html";
});

// S T O R E---------------------S T O R E//

async function carregarProdutos(){

  const snapshot = await get(ref(db,"products"));

  if(snapshot.exists()){

    console.log(snapshot.val());

  }

}

const produtos = [
  {
    id: 1,
    name: "Generic E-commerce",
    category: "E-commerce",
    price: 150,
    image: "../sources/images/imagens ecomerce/templatesDestaque/Frame1.png"
  },
  {
    id: 2,
    name: "Tech Store Pro",
    category: "E-commerce",
    price: 150,
    image: "images/template2.jpg"
  },
  {
    id: 3,
    name: "Cosmetics Elegance",
    category: "E-commerce",
    price: 150,
    image: "images/template3.jpg"
  },
  {
    id: 4,
    name: "Fashion Elegance",
    category: "E-commerce",
    price: 150,
    image: "../sources/images/imagens ecomerce/templatesEcomerce/frame1.png"
  },
  {
    id: 5,
    name: "Essencial Decor",
    category: "E-commerce",
    price: 150,
    image: "../sources/images/imagens ecomerce/templatesEcomerce/frame2.png"
  },
  {
    id: 6,
    name: "Studio Mobília",
    category: "E-commerce",
    price: 150,
    image: "../sources/images/imagens ecomerce/templatesEcomerce/frame3.png"
  },
  {
    id: 7,
    name: "FlexTask Tech",
    category: "Landing Page",
    price: 150,
    image: "../sources/images/imagens ecomerce/templatesLandingPg/frame1.png"
  },
  {
    id: 8,
    name: "EcoTravel",
    category: "Landing Page",
    price: 150,
    image: "../sources/images/imagens ecomerce/templatesLandingPg/frame2.png"
  },
  {
    id: 9,
    name: "Nexus Inovação",
    category: "Landing Page",
    price: 150,
    image: "../sources/images/imagens ecomerce/templatesLandingPg/frame3.png"
  },
  {
    id: 10,
    name: "Portfólio Digital",
    category: "Portfólio",
    price: 150,
    image: "../sources/images/imagens ecomerce/templatesPortifolio/frame1.png"
  },
  {
    id: 11,
    name: "Visual Storyteller",
    category: "Portfólio",
    price: 150,
    image: "../sources/images/imagens ecomerce/templatesPortifolio/frame2.png"
  },
  {
    id: 12,
    name: "Creative Studio Dark",
    category: "Portfólio",
    price: 150,
    image: "../sources/images/imagens ecomerce/templatesPortifolio/frame3.png"
  }
];


async function criarProdutos() {

  const produtosRef = ref(db, "products");

  // Verifica se já existem produtos
  const snapshot = await get(produtosRef);

  if (snapshot.exists()) {
    console.log("Produtos já cadastrados.");
    return;
  }

  // Cadastra todos os produtos
  for (const produto of produtos) {

    await set(
      ref(db, `products/${produto.id}`),
      {
        name: produto.name,
        category: produto.category,
        price: produto.price,
        image: produto.image
      }
    );

  }

  console.log("Produtos cadastrados com sucesso!");

}

criarProdutos();

async function adicionarCarrinho(productId) {

    const session = JSON.parse(localStorage.getItem("session"));

    if (!session) {
        console.log("Faça login.");
        return;
    }

    const userId = session.userId;

    const itemRef = ref(db, `carts/${userId}/items/${productId}`);

    const snapshot = await get(itemRef);

    if (snapshot.exists()) {

        const item = snapshot.val();

        await set(itemRef, {
            productId: Number(productId),
            quantity: item.quantity + 1
        });

    } else {

        await set(itemRef, {
            productId: Number(productId),
            quantity: 1
        });

    }

    console.log("Produto adicionado ao carrinho.");

}

document.querySelectorAll(".buy-btn").forEach(btn=>{

    btn.addEventListener("click",()=>{

        adicionarCarrinho(btn.dataset.product);

    });

});