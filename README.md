# Vitral Frontend

Frontend React + TypeScript do Vitral, integrado ao backend Spring em `/api/v1`.

O histórico técnico e funcional das Sprints 1, 2 e 3 está em
[docs/SPRINTS.md](docs/SPRINTS.md).

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
- busca de produtos e sebos, incluindo descoberta por cidade, UF e proximidade;
- detalhe real do produto por ID;
- perfil público real do sebo por ID;
- categorias e produtos por categoria;
- favoritos do usuário;
- cesta/carrinho persistido;
- quantidade de itens na cesta;
- confirmação de pedido a partir da cesta, com pagamento simulado (mock) e escolha da forma de pagamento;
- cancelamento de pedido pelo usuário enquanto aguarda confirmação;
- histórico de pedidos do usuário;
- compras recebidas pelo sebo;
- confirmação ou recusa de vendas pelo sebo;
- histórico de vendas do sebo;
- ofertas ativas (vitrine pública);
- gestão de ofertas pelo sebo (criar, editar, desativar e listar as próprias ofertas);
- lançamentos;
- mensagens entre contas;
- estoque e categoria no cadastro de produtos;
- exclusão de conta de usuário comum e de sebo;
- proteção de rotas para usuário autenticado e contas `SEBO`.

## Descoberta de sebos por localização

Na aba **Sebos** da busca, o usuário pode filtrar por cidade e UF ou selecionar
**Ordenar por proximidade**. A segunda opção solicita a localização ao navegador
e permite limitar os resultados a 5, 10, 25, 50 ou 100 km; o valor padrão é
25 km e também é possível pesquisar sem limite de distância.

Quando a localização está ativa, os resultados são ordenados do sebo mais
próximo para o mais distante e exibem a distância aproximada. Se o navegador
não oferecer geolocalização, a permissão for negada ou a obtenção expirar, a
interface orienta o usuário a continuar pelos filtros de cidade e UF.

As coordenadas são usadas apenas na requisição de busca. Elas não são gravadas
na URL nem persistidas pelo frontend. A URL mantém somente os filtros que podem
ser compartilhados, como `cidade`, `uf` e `raioKm`.

O recurso depende de:

- permissão de localização concedida pelo usuário;
- contexto seguro (`https`) em produção ou `localhost` em desenvolvimento;
- backend compatível com os parâmetros `lat`, `lng` e `raioKm`.

## Paginação e atualização das telas

As listagens de **Clássicos** e **Lançamentos** são paginadas pelo backend. Ao
trocar de página, a interface apresenta novamente o estado de carregamento e
limpa mensagens de erro anteriores, sem carregar o catálogo inteiro em memória.

No painel administrativo, usuários, produtos, sebos, pedidos e auditoria também
usam paginação. Mudanças de página ou de termo de busca iniciam um novo estado
de carregamento. Respostas de requisições antigas são ignoradas quando a tela ou
o filtro muda, evitando que uma resposta atrasada substitua dados mais recentes.

Ao ativar ou desativar usuários e produtos, a linha alterada é atualizada com a
resposta da API, sem uma segunda consulta completa. Nas listas exclusivas de
itens inativos, um item reativado é removido imediatamente da visualização.

## Deploy (Vercel)

A política de branches, critérios de promoção e rollback está documentada em
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). As branches permitidas para Preview
também estão declaradas no `vercel.json`.

O frontend é publicado na Vercel e o backend no Render, em domínios diferentes.
Duas configurações são obrigatórias para o ambiente publicado funcionar:

1. `VITE_API_BASE_URL` precisa apontar para a URL absoluta do backend
   (ex.: `https://vitral-backend.onrender.com/api/v1`). Sem isso o Axios usa o
   caminho relativo e as chamadas caem no próprio domínio da Vercel.
2. O `vercel.json` roteia `/api/v1/uploads/*` para o backend antes do rewrite
   que serve o SPA. Isso é necessário porque o backend devolve `fotoUrl` e
   `arquivoUrl` como caminhos relativos: em desenvolvimento o proxy do Vite
   resolve, mas em produção o navegador buscaria a imagem no domínio da Vercel
   e o rewrite catch-all responderia `index.html`, quebrando toda tag `<img>`.

## Validação

Antes de abrir PR ou fazer push, rode:

```bash
npm test -- --run
npm run lint
npm run build
```

O build divide as páginas por rota e valida um orçamento de 275 kB para o
JavaScript inicial. O limite pode ser reduzido gradualmente ou sobrescrito em
uma medição controlada com `BUNDLE_ENTRY_LIMIT_KB`.

Os testes automatizados cobrem os serviços de busca, ativação e falha da
geolocalização, alteração do raio, limpeza dos filtros, paginação e principais
fluxos administrativos.

O workflow **Frontend CI** executa testes, lint e build em pushes e pull
requests. O fluxo integrado de localização pode ser validado localmente com:

```bash
npm run test:e2e -- --grep "descobre sebos próximos"
```

### Preview na Vercel

Se a Vercel mostrar `Deployment was blocked` com o CI aprovado, um administrador
do projeto `vitral2` deve autorizar a branch em **Settings → Git** ou manter a
regra de que somente `development` gera deploy. Essa permissão pertence à conta
da Vercel e não pode ser alterada pelo código do repositório.
