require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.listen(3000, () => {
    console.log("Servidor iniciado na porta 3000");
});

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

app.post("/teste", (req, res) => {
    console.log("POST TESTE");
    res.json({ ok: true });
});