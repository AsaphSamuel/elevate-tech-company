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
  update,
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

async function updateInDatabase(updates, userId) {
  try {
    await update(ref(db, `user/${userId}`), updates);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    return false;
  }
}

function getValue(selector) {
  const el = document.querySelector(selector);
  return el ? el.value.trim() : "";
}

let imageRemove;

function getFilledFields() {
  const username = getValue("#txt-user");
  const photoUrl = getValue("#photoUrl");

  let updates = {};

  if (username) {
    updates["user"] = username;
  }

  if (photoUrl) {
    updates["img"] = photoUrl;
  } 
  else if(imageRemove) {
    updates["img"] = photoUrl;
  }

  return updates;
}

const session = JSON.parse(localStorage.getItem("session"));

const GET_USER = await getInDatabase("user", session.userId);

document.querySelector("#txt-user").value = GET_USER;

const GET_EMAIL = await getInDatabase("email", session.userId);

const emailInput = document.querySelector("#email");

if (emailInput) {
  emailInput.value = GET_EMAIL;
}

const input = document.querySelector("#photoUrl");
const preview = document.querySelector("#profilePreview");

input.addEventListener("input", () => {
  const url = input.value.trim();

  if (url) {
    preview.src = url;

    preview.onerror = () => {
      preview.src = "../images/default-user.png";
    };
  }
});

async function loadUserImage() {
  const imgUrl = await getInDatabase("img", session.userId);

  const profileImg = document.querySelector("#profilePreview");

  if (!profileImg) return;

  if (imgUrl) {
    profileImg.src = imgUrl;
    document.querySelector("#photoUrl").value = imgUrl;
  } else {
    document.querySelector("#photoUrl").value = "";
    profileImg.src = "../images/default-user.png";
  }
}

loadUserImage();

document.querySelector("#btn-sigin").addEventListener("click", async () => {
  const session = JSON.parse(localStorage.getItem("session"));
  const userId = session.userId;

  const updates = getFilledFields();


  console.log("UPDATES:", updates);

  if (Object.keys(updates).length === 0) {
    console.log("Nada para salvar");
    return;
  }

  const success = await updateInDatabase(updates, userId);

  if (success) {
    console.log("Dados atualizados!");

    const session = JSON.parse(localStorage.getItem("session"));

    localStorage.setItem("session", JSON.stringify(session));
    location.href = "index.html";
  }
});

document.querySelector("#pp-overlay").addEventListener("click", async () => {
  const profileImg = document.querySelector("#profilePreview");

  profileImg.src = "../images/default-user.png";

  document.querySelector("#photoUrl").value = "";
  imageRemove = true;
});

document.querySelector("#arrow").addEventListener("click", async () => {
  const session = JSON.parse(localStorage.getItem("session"));

  localStorage.setItem("session", JSON.stringify(session));
  location.href = "index.html";
});

document.querySelector("#logout").addEventListener("click", async () => {
  const session = JSON.parse(localStorage.getItem("session"));

  session.expiresAt = Date.now();

  localStorage.setItem("session", JSON.stringify(session));
  location.href = "index.html";
});
