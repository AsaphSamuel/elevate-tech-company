document.querySelector("#registerForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const user = document.querySelector("#user").value.trim().toLowerCase();
    const email = document.querySelector("#email").value.trim();
    const pass = document.querySelector("#pass").value;

    const msg = document.querySelector("#lbl-error");

    msg.innerText = "";

    try {

        const response = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user,
                email,
                pass
            })
        });

        const data = await response.json();

        if (!response.ok) {
            msg.innerText = data.message;
            return;
        }

        window.location.href = "login.html";

    } catch (error) {

        console.error(error);

        msg.innerText = "Erro ao conectar com o servidor.";

    }

});