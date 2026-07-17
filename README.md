<div align="center">

# elevate#
### Technology Company

*Elevando negócios através da tecnologia.*

</div>

---

## 💡 A ideia

A maioria dos pequenos negócios e profissionais autônomos sabe que precisa
de um site — mas esbarra em dois problemas: contratar um desenvolvedor do
zero é caro e demorado, e os construtores genéricos ("faça seu site em 5
minutos") entregam páginas que parecem todas iguais e não passam confiança.

A **elevate#** nasceu como resposta a esse meio-termo: uma loja de
**templates profissionais prontos**, organizados por tipo de necessidade
(e-commerce, landing page, portfólio), com design de verdade por trás —
não um gerador automático, mas modelos pensados para conversão, feitos por
quem entende de UX. O cliente escolhe o modelo que combina com o negócio
dele, compra, e sai na frente sem precisar começar do zero.

> **Quem somos:** a Elevate transforma ideias em experiências digitais
> modernas, funcionais e escaláveis. Desenvolvemos sites, landing pages e
> softwares web sob medida para empresas que buscam crescer com
> tecnologia, performance e presença digital forte.
>
> **Nossa visão:** tecnologia vai além de código — ela cria conexões,
> gera valor e impulsiona negócios. Desenvolvemos produtos digitais que
> combinam inovação, identidade visual e experiências intuitivas para
> destacar marcas no ambiente digital.

## 🎯 Público-alvo

- Pequenos e médios negócios que precisam de presença digital rápida
- Profissionais autônomos (fotógrafos, consultores, criadores) que
  precisam de um portfólio profissional
- Lojistas que querem entrar em e-commerce sem contratar uma agência
- Empreendedores validando uma ideia com uma landing page antes de
  investir pesado em desenvolvimento

## 🧱 O que o site oferece

| Categoria | Proposta |
|---|---|
| **E-commerce** | Modelos com foco em conversão e showcase de produto — pensados pra quem vende online |
| **Landing Pages** | Alta conversão para campanhas, lançamentos e captação de lead |
| **Portfólios** | Vitrine profissional para quem vende serviço ou trabalho autoral |

Cada template é vendido por um preço fixo (R$150), com prévia visual na
própria loja antes da compra — sem letra miúda.

## 🗺️ Jornada do usuário

```
Descobrir (Home)  →  Entender o produto (Sobre)  →  Ver os modelos (Store)
      →  Adicionar ao carrinho  →  Criar conta / Login  →  Finalizar
      compra (cartão ou Pix)  →  Gerenciar o perfil (Minha Conta)
```

- **Home** — apresentação da marca, prova social e chamada para a loja
- **Sobre / Contato** — quem é a Elevate e um canal direto de contato
- **Store** — catálogo filtrável por categoria, com carrinho lateral
  persistente
- **Pagamento** — checkout com cartão ou Pix, resumo do pedido em tempo
  real
- **Conta** — login, cadastro e edição de perfil (nome, foto)

## 🎨 Identidade visual

Paleta em tons de **verde-petróleo** (`#123944` / `#1d4e59`) e **creme**
(`#efe8de` / `#ebe7e0`), transmitindo solidez e profissionalismo sem cair
no "corporativo genérico" — com um dourado (`#d4a13a`) reservado para os
pontos de ação mais importantes, como o botão de finalizar compra. Os
ícones seguem a linha *Phosphor Icons*, escolhidos para reforçar as
mensagens-chave da marca: velocidade (raio), confiabilidade (escudo),
resultado (gráfico) e crescimento (foguete — a própria ideia de "elevar"
um negócio).

Protótipo e paleta completos em [`/design`](./design) e
[`/figma`](./figma/figmaProject.txt).

## ⚙️ Como o projeto é construído

O site evoluiu de um front-end 100% client-side (com credenciais expostas
no navegador) para uma arquitetura com **front-end e back-end separados**:

```
frontend/   →  site estático (HTML, CSS, JS puro) — o que o usuário vê
backend/    →  API em Node/Express — dona das regras de negócio,
                das credenciais do banco e do cálculo de preço/total
```

O front-end nunca fala com o banco de dados diretamente; tudo passa pela
API, que valida sessão, recalcula preços e só então autoriza qualquer
ação sensível (adicionar ao carrinho, fechar pedido, editar perfil).

Detalhes técnicos completos — como rodar localmente, variáveis de
ambiente, dependências e como fazer o deploy — estão no
**[SETUP.md](./SETUP.md)**.

## 🚀 Próximos passos (ideias para evoluir)

- Filtro de categoria persistindo a seleção na URL (compartilhável)
- Histórico de pedidos na tela "Minha Conta"
- Avaliação/nota dos templates por quem já comprou
- Painel administrativo para cadastrar novos templates sem mexer em código

---

<div align="center">

Feito por **elevate# Technology Company**

</div>