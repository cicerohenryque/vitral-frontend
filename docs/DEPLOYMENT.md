# Política de deploy e Preview

## Ambientes e branches

- **Produção:** a branch `development` é a única branch de produção. Todo deploy
  nesse ambiente deve partir de merge revisado e com o workflow `Frontend CI`
  aprovado.
- **Preview:** branches `sprint*/**`, `feature/**`, `fix/**` e `hotfix/**` geram
  Preview para validação funcional antes do merge.
- **Demais branches:** não geram deploy automático. Isso inclui branches de
  manutenção automatizada; elas devem ser validadas pelo CI e revisadas antes
  de serem incorporadas a uma branch com Preview.

As regras de Preview ficam versionadas em `vercel.json`, na propriedade
`git.deploymentEnabled`. A branch de produção também deve ser configurada como
`development` em **Vercel → Settings → Environments → Production → Branch
Tracking**, pois essa associação pertence ao projeto na Vercel.

## Critérios de promoção

1. Testes, lint e build do frontend aprovados no GitHub Actions.
2. CI e migrations do backend aprovados.
3. Preview validado nos fluxos afetados, inclusive em viewport móvel.
4. Variáveis do ambiente conferidas, principalmente `VITE_API_BASE_URL`.
5. Merge em `development` realizado somente após revisão.

Falhas no deploy não devem ser contornadas com um novo push sem diagnóstico.
Quando o CI estiver aprovado e a Vercel indicar `Deployment was blocked`, deve-se
conferir a permissão do autor e a conexão do GitHub App nas configurações da
equipe Vercel.

## Rollback

Em regressões, reverta o commit ou merge em `development` e deixe a Vercel gerar
um novo deploy. A promoção manual de um deployment anterior pode ser usada como
contenção imediata, mas a reversão deve permanecer registrada no Git.
