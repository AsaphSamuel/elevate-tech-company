const bcrypt = require("bcrypt");

const {
    getDatabase,
    ref,
    push,
    set,
    query,
    orderByChild,
    equalTo,
    get
} = require("firebase/database");

const db = require("../firebase");

async function existeNome(username) {

    const usuariosRef = ref(db, "user");

    const q = query(
        usuariosRef,
        orderByChild("user"),
        equalTo(username)
    );

    const snapshot = await get(q);

    return snapshot.exists();
}

async function existeEmail(email) {

    const usuariosRef = ref(db, "user");

    const q = query(
        usuariosRef,
        orderByChild("email"),
        equalTo(email)
    );

    const snapshot = await get(q);

    return snapshot.exists();
}

exports.register = async (req, res) => {
    
    try {

        const { user, email, pass } = req.body;

        if (!user || !email || !pass) {
            return res.status(400).json({
                message: "Todos os campos são obrigatórios."
            });
        }

        const nomeExiste = await existeNome(user);

        if (nomeExiste) {
            return res.status(409).json({
                message: `Já existe um usuário com o nome ${user}`
            });
        }

        const emailExiste = await existeEmail(email);

        if (emailExiste) {
            return res.status(409).json({
                message: "Já existe um usuário com este email."
            });
        }

        const senhaHash = await bcrypt.hash(pass, 10);

        const usuariosRef = ref(db, "user");

        const novoUserRef = push(usuariosRef);

        await set(novoUserRef, {
            user,
            email,
            pass: senhaHash,
            perm: false
        });

        return res.status(201).json({
            message: "Usuário criado com sucesso."
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Erro interno."
        });

    }

};