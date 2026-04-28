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