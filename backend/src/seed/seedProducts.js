require("dotenv").config();
const { db } = require("../config/firebaseAdmin");
const produtos = require("./productsData");

async function seed() {
  const snapshot = await db.ref("products").get();

  if (snapshot.exists()) {
    console.log("Produtos já cadastrados — nada foi alterado.");
    process.exit(0);
  }

  const updates = {};
  produtos.forEach((produto) => {
    updates[produto.id] = {
      name: produto.name,
      category: produto.category,
      price: produto.price,
      image: produto.image
    };
  });

  await db.ref("products").update(updates);

  console.log(`${produtos.length} produtos cadastrados com sucesso.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Erro ao popular produtos:", err);
  process.exit(1);
});
