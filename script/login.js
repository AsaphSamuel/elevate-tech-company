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

async function existeNome(username) {
    const usuariosRef = ref(db, 'user');

    const q = query(
        usuariosRef,
        orderByChild('user'),
        equalTo(username)
    );

    const snapshot = await get(q);

    return snapshot.exists();
}
async function existeEmail(email) {
    const usuariosRef = ref(db, 'user');

    const q = query(
        usuariosRef,
        orderByChild('email'),
        equalTo(email)
    );

    const snapshot = await get(q);

    return snapshot.exists();
}
async function getIdByName(username) {
  const usuariosRef = ref(db, "user");

  const q = query(
    usuariosRef,
    orderByChild("user"),
    equalTo(username)
  );

  const snapshot = await get(q);

  if (snapshot.exists()) {
    const data = snapshot.val();

    const ids = Object.keys(data);

    return ids[0];
  }

  return null;
}
async function getIdByEmail(email) {
  const usuariosRef = ref(db, "user");

  const q = query(
    usuariosRef,
    orderByChild("email"),
    equalTo(email)
  );

  const snapshot = await get(q);

  if (snapshot.exists()) {
    const data = snapshot.val();
    const ids = Object.keys(data);
    return ids[0];
  }

  return null;
}

async function getPassId(userId) {
  const userRef = ref(db, `user/${userId}`);

  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    const data = snapshot.val();
    return data.pass;
  }

  return null;
}

document.querySelector("#btn-login").addEventListener("click", async () => {
    const USER_LOGIN = document.querySelector("#user").value.toLowerCase();
    const PASS_LOGIN = document.querySelector("#pass").value;
    const msg = document.querySelector("#lbl-error");

    try {
        let userId = null;

        if (await existeNome(USER_LOGIN)) {
            userId = await getIdByName(USER_LOGIN);
        } 
        else if (await existeEmail(USER_LOGIN)) {
            userId = await getIdByEmail(USER_LOGIN);
        }

        if (!userId) {
            msg.innerText = "Usuário não encontrado.";
            return;
        }

        const senhaBanco = await getPassId(userId);

        if (senhaBanco === PASS_LOGIN) {
            console.log("Login feito id:", userId);

            const agora = Date.now();
            const expiraEm = 24 * 60 * 60 * 1000;

            const session = {
                userId: userId,
                token: Math.random().toString(36).substring(2),
                expiresAt: agora + expiraEm
            };

            localStorage.setItem("session", JSON.stringify(session));

            window.location.href = "index.html";
        } else {
            msg.innerText = "Senha incorreta.";
        }

    } catch (error) {
        console.error(error);
        msg.innerText = "Erro ao fazer login.";
    }
});