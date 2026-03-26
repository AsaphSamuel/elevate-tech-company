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
  get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUZH2lq3TMQB2GBMpkbXq2J5iuBRWu4_g",
  authDomain: "elevate-tech-co.firebaseapp.com",
  projectId: "elevate-tech-co",
  storageBucket: "elevate-tech-co.firebasestorage.app",
  messagingSenderId: "492241667071",
  appId: "1:492241667071:web:168f43a74c0eff0ca85dca"
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

const session = JSON.parse(localStorage.getItem("session"));

async function loadUserIcon() {
  const imgUrl = await getInDatabase("img", session.userId);

  const userIcon = document.querySelector("#userIcon");

  if (!userIcon) return;

  const finalImg = imgUrl || "../images/default-user.png";

  userIcon.src = finalImg;

  userIcon.onerror = () => {
    userIcon.src = "../images/default-user.png";
  };
}

loadUserIcon();