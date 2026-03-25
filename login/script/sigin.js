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

async function cadastrar(username, email, password) {
    try {
        const existe = await existeNome(username);

        if (existe) {
        console.log("❌ Usuário já existe");
        return;
        }

        const usuariosRef = ref(db, 'user');
        const novoUserRef = push(usuariosRef);

        await set(novoUserRef, {
        user: username,
        email: email,
        pass: password,
        perm: false
        });

        console.log("✅ Usuário cadastrado com sucesso");
    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
    }
}

document.querySelector("#btn-sigin").addEventListener("click", async () => {
    const user = document.querySelector("#user")?.value?.toLowerCase() || "";
    const email_cad = document.querySelector("#email").value;
    const pass = document.querySelector("#pass")?.value || "";

    if(user == "") {
        document.querySelector("#user").placeholder = "Preencha esse campo!";
    }if(email_cad == "") {
        document.querySelector("#email").placeholder = "Preencha esse campo!";
    }if(pass == "") {
        document.querySelector("#pass").placeholder = "Preencha esse campo!";
    }

    if(user != "" && email_cad != "" && pass != "") {
        const nomeExiste = await existeNome(user);
        const emailExiste = await existeEmail(email_cad);

        if(!nomeExiste && !emailExiste) {
            try{
                const msg = document.querySelector("#lbl-error");

                msg.innerText = '';

                await cadastrar(user, email_cad, pass);

                console.log("Usuario criado: " + user, email_cad, pass);

                window.location.href = "login.html";
            } catch{
                const msg = document.querySelector("#lbl-error");

                msg.innerText = "Erro ao tentar cadastrar usuário, Tente novamente.";
            }
        }
        if(await existeNome(user)) {
            const msg = document.querySelector("#lbl-error");
            
            msg.innerText = `Já existe um usuário com o nome ${user}`;
        };
        if(existeEmail(email_cad)) {
            const msg = document.querySelector("#lbl-error");

            msg.innerText = 'Já existe um usuário com este email.';
        };
    }
});

