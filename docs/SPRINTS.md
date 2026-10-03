# Histórico técnico e funcional — Sprints 1 a 3

Este documento registra as entregas incorporadas à branch
`sprint3/prioritized-improvements`. Ele complementa o README de instalação e
deve ser atualizado quando uma funcionalidade destas sprints mudar.

## Visão consolidada

| Sprint | Entregas principais |
| --- | --- |
| Sprint 1 | Mensagens de feedback, confirmações, responsividade dos estados e regressão da busca. |
| Sprint 2 | Busca, filtros, visualização do catálogo e sebos, recomendações, acessibilidade, desempenho, ajustes visuais e administração. |
| Sprint 3 | Melhorias priorizadas, estabilidade, localização, correção de regressões, testes e documentação. |

## Sprint 1 — Feedback e estabilidade inicial

### Mensagens ao usuário

- Erros genéricos foram substituídos por mensagens que informam o que falhou e
  orientam a próxima ação.
- Estados de sucesso, aviso, carregamento e lista vazia foram padronizados nas
  telas de autenticação, perfil, busca, carrinho, checkout, favoritos, pedidos,
  vendas, mensagens, ofertas, produtos, sebos, suporte e recomendações.
- Confirmações destrutivas identificam a ação e suas consequências; botões usam
  verbos como **Excluir**, **Desativar**, **Limpar** e **Cancelar**.
- Erros retornados pela API são aproveitados quando seguros e compreensíveis;
  quando não há detalhe utilizável, a interface aplica uma mensagem contextual.
- Os estados foram ajustados para desktop e dispositivos móveis, evitando
  estouro de texto e perda de ações importantes.

### Regressão da busca

- O fluxo de pesquisa e seus parâmetros de URL receberam testes de regressão.
- A alternância entre produtos e sebos, filtros, paginação e termos vazios é
  preservada nas navegações subsequentes.

## Sprint 2 — Experiência, recomendação e administração

### Busca e filtros

- A busca apresenta abas distintas para produtos e sebos, total de resultados,
  carregamento, erro, lista vazia e opção de tentar novamente.
- Produtos podem ser filtrados por condição, faixa de preço, sebo, categoria e
  gênero quando a categoria representa livros.
- Ordenações disponíveis incluem relevância, menor/maior preço e itens mais
  recentes, mantendo os filtros na URL para navegação e compartilhamento.
- Valores inválidos ou combinações incoerentes são normalizados ou exibem uma
  orientação antes da requisição.
- Sebos podem ser filtrados por cidade e UF.

### Apresentação de produtos e sebos

- Cards de produto passaram a organizar imagem, título, autor, condição,
  disponibilidade, preço normal e preço promocional com hierarquia consistente.
- A página de produto foi reorganizada para leitura em desktop e mobile,
  preservando ações de compra e favorito e deixando indisponibilidade explícita.
- O perfil público do sebo passou a destacar identidade, informações de contato,
  modalidade de atendimento e catálogo, com layout responsivo.
- Foram adicionadas páginas próprias e paginadas para **Clássicos** e
  **Lançamentos**, evitando limitar a descoberta aos itens exibidos na Home.

### Recomendações personalizadas

- A tela autenticada de recomendações possui carregamento, erro recuperável,
  lista vazia, paginação e cards sem duplicação visual.
- O usuário pode limpar o histórico usado pelo ranking mediante confirmação
  explícita; após a limpeza, a tela recarrega o fallback disponível.
- O frontend preserva o contrato público da API e não recebe componentes
  internos do score.

### Acessibilidade

- Navegação principal e menu lateral receberam nomes acessíveis, controle de
  foco, fechamento por teclado e devolução do foco ao acionador.
- Campos de data/hora, formulários, estados, botões e regiões de conteúdo usam
  rótulos e semântica compatíveis com tecnologias assistivas.
- Contraste, foco visível, textos e componentes responsivos foram revisados.
- Há auditoria automatizada com axe para todas as rotas relevantes em larguras
  equivalentes a desktop e mobile, além de testes específicos de teclado/foco.

### Desempenho e estabilidade

- Home, clássicos, lançamentos e categorias usam respostas limitadas ou
  paginadas, sem carregar catálogos completos na memória do navegador.
- Mudanças de página exibem carregamento e descartam respostas de componentes
  desmontados, reduzindo condições de corrida.
- Estados de erro anteriores são limpos ao iniciar uma nova tentativa válida.

### Painel administrativo

- A rota `/admin` é exclusiva para contas `ADMIN` e apresenta visão geral,
  usuários, produtos, sebos, pedidos, moderação e auditoria.
- O administrador pode pesquisar e paginar registros, ativar/desativar contas
  não administrativas e produtos, consultar sebos e pedidos e acompanhar ações
  administrativas registradas.
- A revisão de cadastros de sebos continua disponível em `/admin/sebos`.
- Senhas, hashes, tokens, documentos de autenticação e outros segredos não são
  exibidos pelo painel.
- A interface atualiza localmente itens alterados e ignora respostas atrasadas,
  evitando consultas redundantes e dados fora de ordem.

## Sprint 3 — Melhorias priorizadas e localização

### Melhorias priorizadas

- Paginação de clássicos e lançamentos recebeu estados de transição consistentes.
- Listas administrativas passaram a tratar troca de página, busca, desmontagem
  do componente e atualização de status sem recarregar toda a coleção.
- Foram corrigidas regressões de filtros e parâmetros introduzidas durante a
  evolução da busca.

### Localização e descoberta de sebos

- Na aba **Sebos**, o usuário pode autorizar a geolocalização do navegador e
  ordenar os resultados pela distância.
- O raio pode ser 5, 10, 25, 50 ou 100 km, ou ficar sem limite; o padrão é 25 km.
- Distâncias menores que 1 km são mostradas em metros e as demais em quilômetros.
- Permissão negada, timeout, navegador incompatível e posição indisponível têm
  mensagens próprias e permitem continuar por cidade e UF.
- Coordenadas permanecem apenas em memória e na requisição. A URL não grava a
  posição do usuário.
- **Limpar filtros** remove raio, coordenadas e estado de proximidade; valores de
  raio adulterados na URL retornam ao padrão seguro.

### Testes atualizados

- Serviços enviam os parâmetros de busca e localização esperados.
- Ativação, alteração de raio, bloqueio da permissão e limpeza da proximidade são
  cobertos por testes de interface.
- A suíte também cobre feedback, acessibilidade, administração, recomendações,
  filtros, paginação e fluxos integrados existentes.

## Validação da entrega

Execute antes de publicar alterações:

```bash
npm test -- --run
npm run lint
npm run build
```

Na validação desta branch, 356 testes do frontend foram aprovados, além do lint
e do build de produção. O número é um retrato desta entrega e pode aumentar com
novos testes.

## Limites conhecidos

- Geolocalização depende de permissão do usuário e de contexto seguro no
  navegador.
- O cálculo e o filtro por distância são executados pelo backend; o frontend não
  tenta inferir coordenadas a partir do endereço.
- Auditorias automatizadas de acessibilidade ajudam a detectar violações, mas
  não substituem testes manuais com teclado e leitores de tela reais.
