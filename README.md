# Vitral Frontend

Frontend React + TypeScript do Vitral, integrado ao backend Spring em `/api/v1`.

## Requisitos

- Node.js compatível com Vite 8
- npm
- Backend Vitral rodando localmente, por padrão em `http://localhost:8080`

## Configuração

Crie um arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Variáveis disponíveis:

```bash
VITE_API_URL=http://localhost:8080
VITE_API_BASE_URL=/api/v1
```

- `VITE_API_URL`: destino do proxy do Vite para chamadas iniciadas com `/api`.
- `VITE_API_BASE_URL`: base usada pelo Axios. Em desenvolvimento, mantenha `/api/v1` para usar o proxy e evitar CORS.

## Rodando localmente

```bash
npm install
npm run dev
```

O app abre em `http://localhost:5173` e encaminha `/api` para o backend configurado em `VITE_API_URL`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Integrações atuais

Já usam endpoints reais do backend:

- autenticação, cadastro, confirmação de e-mail e logout;
- perfil do usuário autenticado;
- cadastro/edição do perfil do sebo;
- cadastro, edição, listagem e remoção de produtos do sebo;
- busca de produtos e sebos;
- detalhe real do produto por ID;
- perfil público real do sebo por ID;
- proteção de rotas para usuário autenticado e contas `SEBO`.

Rotas sem endpoint no backend exibem estado pendente, sem dados fictícios:

- favoritos;
- carrinho;
- reservas;
- confirmação de pedido;
- histórico de pedidos;
- compras recebidas;
- confirmação/recusa de vendas;
- histórico de vendas;
- mensagens;
- ofertas;
- lançamentos;
- exclusão de conta.

## Validação

Antes de abrir PR ou fazer push, rode:

```bash
npm run lint
npm run build
```
