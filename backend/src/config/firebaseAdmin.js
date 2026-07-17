const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

const credentialsPath = path.resolve(
  process.cwd(),
  process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json"
);

if (!fs.existsSync(credentialsPath)) {
  console.error(
    `\n[firebaseAdmin] Não encontrei o arquivo de credenciais em: ${credentialsPath}\n` +
    "Gere a chave em: Firebase Console > Configurações do projeto > Contas de serviço > Gerar nova chave privada,\n" +
    "salve como 'serviceAccountKey.json' dentro da pasta backend/ e reinicie o servidor.\n"
  );
  process.exit(1);
}

const serviceAccount = require(credentialsPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

module.exports = { admin, db };
