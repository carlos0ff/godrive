# goDrive — Sistema de Locação de Veículos

Projeto da disciplina **Programação com Frameworks Web**. Sistema completo de locadora com
cadastro e login de usuários, cadastro e consulta de veículos, registro de locações e devoluções.

## Integrantes

- Genilson Pereira
- José Carlos
- Matheus Henrique

| Camada   | Tecnologias                                                      |
| -------- | ---------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite (CSS próprio)                          |
| Backend  | Node.js, Express 5, TypeScript, Prisma ORM, JWT, bcrypt (bcryptjs), Zod |
| Banco    | MySQL (ou MariaDB, ex.: XAMPP)                                    |

## Funcionalidades

- Cadastro de usuário com confirmação de e-mail por código, login com JWT, logout e recuperação de senha.
- Cadastro de veículos (usuário logado) com validação de placa única e diária positiva.
- Catálogo de veículos com busca, categoria, filtro de disponibilidade, ordenação e paginação.
- Registro de locação com escolha do veículo, datas e valor calculado no backend.
- Histórico das locações do usuário (ativas e finalizadas) e finalização com registro da devolução.
- Documentação interativa da API com Swagger em `/api/docs`.
- Testes automatizados da API (Vitest + Supertest) em banco separado.
- Proteções extras: cabeçalhos de segurança (helmet) e limite de tentativas de login.

## Modelo de dados

| Entidade            | Campos principais                                                                 |
| ------------------- | --------------------------------------------------------------------------------- |
| `Usuario`           | id, nome, email (único), senhaHash, papel, emailConfirmado, criadoEm             |
| `Veiculo`           | id, marca, modelo, placa (única), ano, categoria, precoDiaria, disponivel, ...   |
| `Locacao`           | id, usuarioId (FK), veiculoId (FK), dataRetirada, dataDevolucao (prevista), devolvidoEm (efetiva), valorDiaria, valorTotal, status (ATIVA/FINALIZADA) |
| `CodigoVerificacao` | id, usuarioId (FK), codigo, finalidade, expiraEm, usadoEm                        |

Relacionamentos 1:N: `Usuario` → `Locacao`, `Veiculo` → `Locacao` e `Usuario` → `CodigoVerificacao`.
Locações e veículos não são excluídos, para preservar o histórico.

## Estrutura

```
godrive/
  backend/            API REST
    prisma/
      schema.prisma   modelos Usuario, Veiculo, Locacao e CodigoVerificacao
      migrations/     migrações do banco
      seed.ts         usuários e veículos iniciais
    testes/           testes automatizados da API (Vitest + Supertest)
    src/
      server.ts       sobe o servidor
      app.ts          Express, helmet, CORS, Swagger, rotas e tratamento de erros
      config.ts       variáveis de ambiente
      prisma.ts       cliente do Prisma
      erros.ts        ErroApp e middleware de erros
      formatar.ts     converte registros do banco para JSON
      docs/openapi.ts documentação OpenAPI exibida pelo Swagger
      middlewares/autenticacao.ts   gera e valida o JWT (autenticar)
      middlewares/limiteLogin.ts    limita tentativas de login (express-rate-limit)
      rotas/          mapeamento dos endpoints para os controllers
      controllers/    entrada e resposta HTTP (authController, veiculoController, locacaoController)
      services/       validações e regras de negócio (authService, veiculoService, locacaoService)
  src/                frontend React
    api.ts            chamadas à API com o token JWT
    sessao.ts         sessão do usuário (token + dados)
    useRecurso.ts     hook de carregamento de dados
    components/       cabeçalho, rodapé, cartão de veículo, estados, ícones
    pages/            uma página por rota
```

## Arquitetura e decisões

- **Routes → Controllers → Services → Prisma.** As rotas só ligam o endpoint ao controller; o
  controller lê `req` (corpo, parâmetros e o usuário do token) e devolve a resposta HTTP; o service
  valida os dados com Zod, aplica as regras de negócio e acessa o banco pelo Prisma.
- **Erros:** os services lançam `ErroApp(status, mensagem)`; o middleware `tratarErros` converte
  em JSON com o código HTTP certo (400, 401, 403, 404, 409). Erros do Zod viram 400.
- **Dono da locação:** o `usuarioId` sempre vem do JWT (`req.usuario.id`), nunca do corpo.
  As consultas filtram por `{ id, usuarioId }`, então a locação de outro usuário responde 404.
- **Concorrência:** registrar e finalizar rodam em `prisma.$transaction`. O veículo só é
  reservado com `updateMany({ where: { id, disponivel: true } })`; se outra requisição já
  reservou, `count` é 0 e a API responde 409. A finalização usa a mesma ideia com
  `status: 'ATIVA'`.
- **Valor total:** calculado no backend: `diárias × valor da diária`, arredondando para cima
  qualquer fração de 24 horas.
- **Rotas protegidas:** todas as rotas de veículos e de locações passam pelo middleware `autenticar`.
  Sem login, a página inicial mostra o herói e um convite para entrar no lugar do catálogo.
- **bcryptjs:** implementação do algoritmo bcrypt em JavaScript puro, com a mesma API e o mesmo
  formato de hash do pacote `bcrypt`, sem precisar compilar código nativo no Windows.
- **Segurança extra (além do pedido):** `helmet` adiciona cabeçalhos HTTP de segurança e
  `express-rate-limit` bloqueia o login por 15 minutos após várias senhas erradas seguidas
  (padrão: 20, ajustável em `LOGIN_RATE_LIMIT`). Logins certos não contam.
- **Senhas:** guardadas com bcrypt (`senhaHash`) e nunca devolvidas: as respostas passam por
  `formatarUsuario`, que expõe só id, nome, e-mail e papel.

## Como rodar

Pré-requisitos: **Node.js 20+** e **MySQL** rodando (no XAMPP, basta iniciar o MySQL).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

Ajuste `DATABASE_URL` no `.env` se o seu MySQL tiver senha
(formato `mysql://usuario:senha@localhost:3306/godrive`). O `db:migrate` cria o banco
`godrive`, as tabelas e roda o seed. A API sobe em `http://localhost:3333/api`.

### 2. Frontend

Em outro terminal, na raiz do projeto:

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. O Vite encaminha `/api` para o backend
(para outra porta, use a variável `API_URL`, ex.: `API_URL=http://localhost:4000`).

### Variáveis de ambiente (`backend/.env`)

| Variável            | Para que serve                                         |
| ------------------- | ------------------------------------------------------ |
| `DATABASE_URL`      | Banco MySQL usado pela API                              |
| `JWT_SECRET`        | Chave para assinar os tokens (troque por uma longa)     |
| `JWT_EXPIRES_IN`    | Validade do token (padrão `1d`)                         |
| `PORT`              | Porta da API (padrão 3333)                              |
| `LOGIN_RATE_LIMIT`  | Tentativas de login erradas permitidas a cada 15 min    |
| `CORS_ORIGIN`       | Endereço do frontend liberado no CORS                   |
| `TEST_DATABASE_URL` | Banco separado usado pelos testes (precisa ter "test" no nome) |

### Usuários de teste (criados pelo seed)

| Perfil        | E-mail                | Senha        |
| ------------- | --------------------- | ------------ |
| Administrador | `admin@godrive.com`   | `admin123`   |
| Cliente       | `cliente@godrive.com` | `cliente123` |

Qualquer usuário logado cadastra veículos e registra locações; cada um vê e finaliza só as próprias locações.

### Códigos de verificação

O cadastro e a recuperação de senha usam um código de 6 dígitos com validade de 15 minutos.
O projeto não envia e-mails de verdade: **o código aparece no terminal do backend**, assim:

```
[e-mail] Código de confirmação de e-mail para ana@exemplo.com: 482913
```

## Documentação interativa (Swagger)

Com a API rodando, abra **http://localhost:3333/api/docs** (ou `http://localhost:5173/api/docs`
pelo frontend). Para testar rotas protegidas: execute `POST /auth/login`, copie o `token`,
clique em **Authorize** e cole o token. Dá para demonstrar todas as rotas por ali na apresentação.

## Testes automatizados

```bash
cd backend
npm test
```

Os testes usam o banco de `TEST_DATABASE_URL` (padrão `godrive_test`, criado automaticamente pelo
`prisma migrate deploy`) e apagam os dados dele a cada caso; por segurança, só rodam se o nome do
banco tiver "test", então o banco `godrive` nunca é tocado. Cobrem: cadastro, confirmação e login
sem expor o hash; 401 sem token; placa duplicada e diária negativa; filtro de disponíveis;
cálculo do valor; datas inválidas; veículo inexistente; 5 locações simultâneas do mesmo carro
(só 1 é aceita); locação de outro usuário (404); finalização e finalização repetida (409).

## Rotas da API

Base: `http://localhost:3333/api`. Rotas com 🔒 exigem o cabeçalho
`Authorization: Bearer <token>`.

### Autenticação

| Método | Rota                     | Corpo                                  | Descrição                               |
| ------ | ------------------------ | -------------------------------------- | --------------------------------------- |
| POST   | `/auth/cadastro`         | `nome`, `email`, `senha`               | Cria a conta e envia o código           |
| POST   | `/auth/confirmar-email`  | `email`, `codigo`                      | Confirma o e-mail                       |
| POST   | `/auth/reenviar-codigo`  | `email`, `finalidade`                  | Reenvia o código (`CONFIRMAR_EMAIL` ou `RECUPERAR_SENHA`) |
| POST   | `/auth/login`            | `email`, `senha`                       | Retorna `token` (JWT) e `usuario`       |
| POST   | `/auth/recuperar`        | `email`                                | Envia código de recuperação de senha    |
| POST   | `/auth/verificar-codigo` | `email`, `codigo`, `finalidade`        | Valida um código sem usá-lo             |
| POST   | `/auth/redefinir-senha`  | `email`, `codigo`, `senha`             | Troca a senha                           |
| GET    | `/auth/perfil` 🔒        | —                                      | Dados do usuário logado                 |

### Veículos

| Método | Rota               | Descrição                                                        |
| ------ | ------------------ | ---------------------------------------------------------------- |
| GET    | `/veiculos` 🔒     | Lista; filtros opcionais `?busca=`, `?categoria=`, `?disponivel=true` |
| GET    | `/veiculos/:id` 🔒 | Detalhe de um veículo                                            |
| POST   | `/veiculos` 🔒     | Cadastra (`marca`, `modelo`, `ano`, `categoria`, `placa`, `precoDiaria`, ...) |

### Locações

| Método | Rota                          | Descrição                                                   |
| ------ | ----------------------------- | ----------------------------------------------------------- |
| GET    | `/locacoes` 🔒                | Lista as locações do usuário logado; filtro `?status=ativa` ou `finalizada` |
| GET    | `/locacoes/:id` 🔒            | Detalhe                                                     |
| POST   | `/locacoes` 🔒                | Registra (`veiculoId`, `dataRetirada`, `dataDevolucao` em `AAAA-MM-DD`) |
| PATCH  | `/locacoes/:id/devolucao` 🔒  | Finaliza a locação e registra a devolução (opcional: `quilometragem`) |

Regras: o valor total é `diárias × preço da diária`; a retirada não pode ser no passado;
a devolução precisa ser depois da retirada; ao locar, o veículo fica indisponível e volta a ficar
disponível na devolução; uma locação finalizada não pode ser finalizada de novo.

### Exemplo com curl

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@godrive.com","senha":"cliente123"}'

curl -X POST http://localhost:3333/api/locacoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"veiculoId":2,"dataRetirada":"2026-12-01","dataDevolucao":"2026-12-04"}'

curl -X PATCH http://localhost:3333/api/locacoes/1/devolucao \
  -H "Authorization: Bearer SEU_TOKEN"
```

Erros voltam como `{ "erro": "mensagem" }` com o status HTTP adequado
(400 validação, 401 sem login, 403 sem permissão, 404 não encontrado, 409 conflito).

## Páginas do frontend

| Rota                | O que faz                                                         |
| ------------------- | ----------------------------------------------------------------- |
| `#/`                | Herói, benefícios e catálogo de veículos (catálogo requer login)   |
| `#/veiculos`        | Catálogo com busca, categoria, disponibilidade, ordenação e paginação (requer login) |
| `#/login`           | Login (JWT)                                                       |
| `#/cadastro`        | Criação de conta                                                  |
| `#/confirmar-email` | Código de 6 dígitos (e nova senha, na recuperação)                |
| `#/recuperar`       | Recuperação de senha                                              |
| `#/veiculos/novo`   | Cadastro de veículo (requer login)                                |
| `#/locacoes`        | Locações e registro de devolução (requer login)                   |
| `#/locacoes/nova`   | Nova locação com valor estimado (requer login)                    |

## Outros comandos

| Onde      | Comando             | O que faz                         |
| --------- | ------------------- | --------------------------------- |
| raiz      | `npm run build`     | Typecheck e build do frontend     |
| raiz      | `npm run lint`      | ESLint do frontend                |
| `backend` | `npm run build`     | Compila a API para `dist/`        |
| `backend` | `npm start`         | Roda a API compilada              |
| `backend` | `npm test`          | Roda os testes da API             |
| `backend` | `npm run db:seed`   | Roda o seed de novo (adiciona os carros que faltarem) |
| `backend` | `npm run db:reset`  | Apaga e recria o banco            |
