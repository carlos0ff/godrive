# Roteiro de apresentação e demonstração

O enunciado pede que o grupo **execute rotas da API** (cadastro/login, listagem de veículos, registro de locação e devolução/finalização) e que **cada aluno responda a uma pergunta sobre o código**, localizando o trecho e explicando a decisão. Este roteiro cobre as duas partes.

## 1. Antes da aula (checklist)

- [ ] MySQL rodando e `backend/.env` configurado.
- [ ] Banco em estado limpo de demonstração: `cd backend && npm run db:deploy && npm run db:seed`.
- [ ] `npm test` no backend passando (14 testes).
- [ ] Dois terminais prontos: `cd backend && npm run dev` e, na raiz, `npm run dev`.
- [ ] Abas abertas: `http://localhost:3333/api/docs` (Swagger) e `http://localhost:5173` (interface).
- [ ] Editor aberto no repositório, com `schema.prisma`, `locacaoService.ts` e `autenticacao.ts` à mão.

Credenciais do seed: `cliente@godrive.com` / `cliente123` e `maria@godrive.com` / `maria123`.

## 2. Demonstração pela API (Swagger) — cerca de 6 minutos

| Passo | Rota | O que mostrar |
| --- | --- | --- |
| 1 | `POST /auth/register` | Criar um usuário novo; a resposta **não tem senha nem hash**. Repetir → **409** e-mail duplicado |
| 2 | `POST /auth/login` | Recebe o `token`. Clicar em **Authorize** e colar o token |
| 3 | `GET /veiculos` sem token (antes do Authorize) | **401**: rota protegida |
| 4 | `GET /veiculos` | Lista com `disponivel`; o **Fiat Pulse** está `false` (locação ativa do seed) |
| 5 | `GET /veiculos/disponiveis` | Só os disponíveis (o Pulse não aparece) |
| 6 | `POST /veiculos` | Cadastrar um carro; repetir a placa → **409**; diária `0` → **400** |
| 7 | `POST /locacoes` | Ex.: início hoje 10:00, devolução prevista daqui a 2 dias às 12:00 → **3 diárias** no `valorTotal` (fração de 24 h = diária completa) |
| 8 | `POST /locacoes` de novo, mesmo veículo | **409** veículo indisponível; com a devolução antes do início → **400** |
| 9 | `GET /locacoes` | Locações do usuário com o `veiculo` incluído (`include`) |
| 10 | `PATCH /locacoes/{id}/finalizar` | `status: FINALIZADA`, `dataDevolucao` preenchida, `veiculo.disponivel: true` |
| 11 | Mesmo `PATCH` de novo | **409** locação já finalizada |
| 12 | Login como `maria@godrive.com` e `PATCH` na locação do outro usuário | **404**: não acessa locação de terceiros |

## 3. Demonstração pela interface React — cerca de 4 minutos

1. **Cadastro** → a conta é criada e o usuário já entra logado (nome no cabeçalho).
2. **Logout** pelo menu da conta → tentar abrir "Minhas locações" redireciona para o login.
3. **Login** com `cliente@godrive.com`.
4. **Catálogo**: ligar e desligar "Somente disponíveis" (usa `GET /veiculos/disponiveis` ou `GET /veiculos`).
5. **Cadastrar veículo**: mostrar a mensagem de erro de placa duplicada e depois o sucesso.
6. **Reservar agora** em um carro → **Nova locação**: escolher as datas e mostrar o resumo; confirmar e ver a mensagem com o **valor calculado pelo sistema**. O carro some da lista de disponíveis.
7. **Minhas locações**: a locação aparece em "Ativas"; clicar em **Finalizar locação** → ela vai para o "Histórico de locações finalizadas" com a data de devolução.

## 4. Mapa do código para a pergunta individual

| Assunto | Onde está |
| --- | --- |
| Modelos, PK, FK, `@unique`, relações 1:N | `backend/prisma/schema.prisma` |
| Migrations | `backend/prisma/migrations/*/migration.sql` |
| Rotas e middleware nas rotas | `backend/src/rotas/auth.ts`, `veiculos.ts`, `locacoes.ts` |
| Controllers (HTTP) | `backend/src/controllers/*.ts` |
| Cadastro com `bcrypt.hash` | `backend/src/services/authService.ts` → `cadastrar` |
| Login com `bcrypt.compare` e token | `authService.login` + `gerarToken` em `backend/src/middlewares/autenticacao.ts` |
| Validação do JWT (`Bearer`, `jwt.verify`, `req.usuarioId`) | `autenticar` em `backend/src/middlewares/autenticacao.ts` |
| Resposta sem senha/hash | `formatarUsuario` em `backend/src/formatar.ts` |
| Placa única e diária positiva | `veiculoService.cadastrar` (`placaEmUso`, `.positive(...)`) |
| Veículos disponíveis | `veiculoService.listarDisponiveis` |
| Registro da locação, transação e concorrência | `locacaoService.registrar` (`prisma.$transaction`, `updateMany`, `locacao.count`) |
| Cálculo das diárias | `calcularDiarias` em `locacaoService.ts` |
| Listagem com `include` | `locacaoService.listar` (`include: { veiculo: true }`) |
| Finalização e bloqueio de terceiros | `locacaoService.finalizar` (`findFirst({ id, usuarioId })`, `updateMany({ status: 'ATIVA' })`) |
| Erros → códigos HTTP | `tratarErros` em `backend/src/erros.ts` |
| Chamada à API com o token | `requisitar` em `src/api.ts` |
| Login/logout no frontend | `iniciarSessao` e `encerrarSessao` em `src/sessao.ts` |
| Formulário de locação (estado e eventos) | `src/pages/NovaLocacaoPage.tsx` → `enviar` |
| Lista, histórico e finalização | `src/pages/LocacoesPage.tsx` → `finalizar` |
| Testes das regras | `backend/testes/api.test.ts` |

## 5. Perguntas prováveis e resposta curta

- **Por que a regra fica no Service e não na rota?** Para separar responsabilidades: a rota só mapeia, o controller cuida do HTTP e o service concentra a regra, que pode ser testada e reaproveitada.
- **O que acontece se dois usuários alugarem o mesmo carro ao mesmo tempo?** O `updateMany` com `disponivel: true` dentro da transação só funciona para o primeiro; o segundo recebe 409 (há teste com 5 requisições simultâneas).
- **Por que o usuário não envia o `usuarioId`?** Porque ele vem do token validado; um id no corpo é ignorado, então ninguém cria locação em nome de outra pessoa.
- **Por que 404 e não 403 na locação de outro usuário?** A busca já filtra por `usuarioId`, então para aquele usuário a locação simplesmente não existe; isso também evita revelar ids de terceiros.
- **Como o valor é calculado?** `Math.ceil((dataPrevistaDevolucao − dataInicio) / 24 h) × valorDiaria`, sempre no backend; o valor mostrado antes de confirmar é só uma estimativa.
- **Por que guardar `valorDiaria` na locação?** Para o histórico não mudar se a diária do veículo mudar depois.
- **Por que bcrypt?** Hash com salt e custo alto: mesmo com acesso ao banco, não dá para recuperar a senha.
