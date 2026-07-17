# elevate# — projeto reorganizado (front-end + back-end separados)

## O que mudou

**Antes:** o site rodava 100% no navegador. O front-end tinha a chave do
Firebase, falava direto com o banco de dados, e a "sessão" era só um objeto
no `localStorage` que qualquer pessoa podia editar no DevTools para virar
outro usuário, ver carrinhos alheios ou forjar total de pedido.

**Agora:**

- `frontend/` — só HTML, CSS e JS estático. Nenhuma credencial, nenhuma
  regra de negócio, nenhum acesso direto ao banco. Fala com o back-end
  só por `fetch`.
- `backend/` — API em Node/Express. É o único lugar que conhece o Firebase
  (via Admin SDK, com uma chave de serviço que nunca vai para o navegador).
  Login é validado com senha com hash (bcrypt), sessão é um JWT em cookie
  `httpOnly` (o JS do navegador não consegue ler nem editar), e o preço/total
  de qualquer compra é sempre recalculado no servidor a partir do banco —
  o front-end nunca manda (nem o servidor confia em) um total vindo do
  cliente.
- **Dados de cartão:** número completo e CVC nunca são gravados em lugar
  nenhum — nem no Firebase, nem em log. Isso é só uma simulação de
  pagamento para o projeto; em produção, cartão tem que passar por um
  gateway certificado (Stripe, Mercado Pago, Pagar.me...), que devolve um
  token para o seu backend guardar.

## Estrutura

```
elevate-tech-company/
├── backend/                 # API (Node + Express + Firebase Admin)
│   ├── src/
│   │   ├── config/           # conexão com o Firebase
│   │   ├── controllers/      # regras de negócio (auth, carrinho, pedidos...)
│   │   ├── middlewares/      # autenticação e tratamento de erros
│   │   ├── routes/           # endpoints da API
│   │   ├── seed/             # cadastro inicial dos produtos
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/                # site estático
    ├── public/                # as páginas .html
    └── sources/
        ├── script/            # .js — agora só chamam a API
        │   ├── api.js           # ponto único de comunicação com o backend
        │   └── session.js       # sessão/menu do usuário (compartilhado)
        ├── styles/             # .css (idênticos, só o botão de finalizar mudou de cor)
        └── images/
```

## Passo a passo para rodar

### 1. Gerar a chave do Firebase Admin

No [Firebase Console](https://console.firebase.google.com/) do projeto
`elevate-tech-company`: **Configurações do projeto → Contas de serviço →
Gerar nova chave privada**. Isso baixa um `.json`.

Renomeie esse arquivo para `serviceAccountKey.json` e coloque dentro de
`backend/` (ele já está no `.gitignore`, então nunca vai ser commitado).

### 2. Configurar e instalar o back-end

```bash
cd backend
cp .env.example .env
```

Edite o `.env`:
- `JWT_SECRET` → gere um valor forte, ex: `openssl rand -hex 64`
- `CLIENT_ORIGIN` → o endereço de onde o front-end vai ser servido
  (ex: `http://127.0.0.1:5500` se usar a extensão Live Server do VS Code)

Instale as dependências:

```bash
npm install
```

Popule os produtos no banco (só precisa rodar uma vez):

```bash
npm run seed
```

Suba a API:

```bash
npm run dev
```

A API sobe em `http://localhost:4000`. Teste em
`http://localhost:4000/api/health` — deve responder `{"status":"ok"}`.

### 3. Servir o front-end

O front-end é estático, mas **precisa ser aberto por um servidor HTTP**
(não abrindo o `.html` direto com duplo clique) — os scripts usam
`import`/módulos ES, que o navegador bloqueia em arquivos abertos como
`file://`.

Qualquer servidor estático funciona. Duas opções simples:

**VS Code (mais fácil):** instale a extensão "Live Server", clique com o
botão direito em `frontend/public/index.html` → "Open with Live Server".

**Ou via linha de comando** (Node já instalado):

```bash
cd frontend/public
npx serve -l 5500
```

Se a porta que você usar for diferente de `5500`, ajuste `CLIENT_ORIGIN`
no `.env` do backend para bater com ela.

### 4. Travar o acesso direto ao Firebase (importante)

Como agora só o backend fala com o Firebase, aproveite para fechar a porta
para qualquer acesso direto de fora. Em **Realtime Database → Regras**,
use:

```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

O Admin SDK do backend ignora essas regras (ele sempre teve acesso total
com a service account), então isso só bloqueia quem tentar acessar o banco
sem passar pela sua API.

## Dependências instaladas

**Backend** (`backend/package.json`):
`express`, `cors`, `helmet`, `morgan`, `cookie-parser`, `dotenv`,
`firebase-admin`, `jsonwebtoken`, `bcryptjs`, `express-rate-limit`
— e `nodemon` como dependência de desenvolvimento.

**Frontend:** nenhuma — HTML/CSS/JS puro, sem build step. Só precisa de um
servidor estático qualquer para servir os arquivos (Live Server, `serve`,
Nginx, etc.).

## Sobre as senhas de usuários já cadastrados

Antes, as senhas ficavam salvas em texto puro no banco. A partir de agora
elas são salvas com hash (bcrypt). Para não travar quem já tinha conta: no
próximo login de uma conta antiga, o backend confere a senha em texto puro
uma última vez e, se bater, converte automaticamente para hash — sem
precisar avisar o usuário ou pedir para recadastrar.

## O que foi melhorado na página da loja (`store.html`)

- **Carregamento do carrinho:** cada ação (adicionar, ±quantidade, remover)
  agora espera a resposta do servidor antes de liberar novos cliques —
  antes, cliques rápidos podiam disparar chamadas simultâneas e deixar o
  carrinho com número errado.
- **Loading:** itens, total e botão de finalizar ficam com `display:none`
  desde o HTML (antes mesmo do JS carregar) e só aparecem quando os dados
  chegam — sem piscar conteúdo vazio ou desatualizado.
- **Botão "Finalizar Compra":** trocado de verde claro para um dourado
  (`#d4a13a`, com hover `#b5872b`) — mais alinhado com a identidade
  teal/creme do site e com mais contraste que o verde original.
