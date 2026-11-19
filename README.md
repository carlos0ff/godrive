<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="src/assets/godrive.png">
  <img src="src/assets/godrive-escuro.png" alt="GoDrive" width="320">
</picture>

# GoDrive — Sistema de Locação de Veículos

Aplicação Full Stack para cadastro de veículos, controle de disponibilidade e registro de locações por usuários autenticados.

![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.12%2B-5FA04E?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-jsonwebtoken-000000?logo=jsonwebtokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-6.0-004E8C)
![Zod](https://img.shields.io/badge/Zod-3-3E67B1?logo=zod&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-carlos0ff%2Fgodrive-181717?logo=github&logoColor=white)

</div>

---

## Sumário

1. [Apresentação](#apresentação)
2. [Objetivo](#objetivo)
3. [Funcionalidades](#funcionalidades)
4. [Tecnologias utilizadas](#tecnologias-utilizadas)
5. [Arquitetura do sistema](#arquitetura-do-sistema)
6. [Estrutura de diretórios](#estrutura-de-diretórios)
7. [Modelagem do banco de dados](#modelagem-do-banco-de-dados)
8. [Relacionamentos](#relacionamentos)
9. [Endpoints da API](#endpoints-da-api)
10. [Autenticação e segurança](#autenticação-e-segurança)
11. [Regras de negócio](#regras-de-negócio)
12. [Decisões técnicas e limitações](#decisões-técnicas-e-limitações)
13. [Pré-requisitos](#pré-requisitos)
14. [Instalação do backend](#instalação-do-backend)
15. [Configuração do MySQL](#configuração-do-mysql)
16. [Configuração do Prisma](#configuração-do-prisma)
17. [Arquivo .env.example](#arquivo-envexample)
18. [Execução das migrations](#execução-das-migrations)
19. [Inicialização do backend](#inicialização-do-backend)
20. [Inicialização do frontend](#inicialização-do-frontend)
21. [Exemplos de utilização](#exemplos-de-utilização)
22. [Testes automatizados](#testes-automatizados)
23. [Roteiro de demonstração](#roteiro-de-demonstração)
24. [Integrantes](#integrantes)
25. [Informações acadêmicas](#informações-acadêmicas)

---

## Apresentação

O **GoDrive** é um sistema web de locação de veículos. A locadora cadastra os carros da frota, cada usuário cria a própria conta e, depois de autenticado, escolhe um veículo disponível, define o período e registra a locação. O valor é calculado pelo backend e, na devolução, a locação é finalizada e o veículo volta a ficar disponível. Todo o histórico fica preservado no banco.

O projeto é dividido em duas aplicações no mesmo repositório:

- **`backend/`** — API REST em Node.js + Express + TypeScript, com Prisma ORM, MySQL, JWT e bcrypt.
- **raiz do repositório** — interface em React + TypeScript (Vite), que consome a API com `fetch`.

## Objetivo

Demonstrar, na prática, uma aplicação Full Stack com:

- separação de responsabilidades entre **Routes**, **Controllers** e **Services**;
- persistência relacional com **Prisma** e **MySQL**, com relacionamentos 1:N e migrations versionadas;
- autenticação com **JWT** e senhas protegidas com **bcrypt**;
- regras de negócio aplicadas no backend, inclusive em requisições simultâneas;
- integração real entre a interface **React** e a API.

## Funcionalidades

| Área | Funcionalidade |
| --- | --- |
| Usuários | Cadastro (nome, e-mail, senha), login com e-mail e senha, identificação do usuário logado no cabeçalho e logout |
| Veículos | Cadastro com validação de placa única e diária positiva; listagem com disponibilidade; consulta apenas dos disponíveis; busca, categoria, ordenação e paginação na interface |
| Locações | Escolha do veículo disponível, data de início e data prevista de devolução; valor calculado no backend; listagem das locações ativas; histórico das finalizadas; finalização com registro da devolução |
| Interface | Mensagens de sucesso e erro vindas da API, rotas protegidas no frontend e atualização da tela após cada operação |
| Extras | Documentação Swagger em `/api/docs`, testes automatizados da API, cabeçalhos de segurança (helmet) e limite de tentativas de login |

Não há edição ou exclusão de veículos e locações, conforme o enunciado (o histórico é preservado).

## Tecnologias utilizadas

| Camada | Tecnologias |
| --- | --- |
| Backend | Node.js 20.12+, Express 5, TypeScript, Prisma ORM 6, MySQL 8, `jsonwebtoken` (JWT), `bcrypt`, Zod (validação), helmet, cors, express-rate-limit, swagger-ui-express |
| Frontend | React 19, TypeScript, Vite 8, CSS próprio, `fetch` nativo |
| Testes | Vitest e Supertest, em um banco MySQL separado |
| Ferramentas | tsx (execução em desenvolvimento), ESLint, Git e GitHub |

## Arquitetura do sistema

```mermaid
flowchart LR
  U[Usuário] --> R[React<br/>páginas e componentes]
  R -- "fetch + Authorization: Bearer" --> A[Express]
  subgraph API REST
    A --> M[Middleware autenticar<br/>valida o JWT]
    M --> RT[Routes<br/>rotas/*.ts]
    RT --> C[Controllers<br/>entrada e resposta HTTP]
    C --> S[Services<br/>validações e regras de negócio]
    S --> P[Prisma Client]
  end
  P --> DB[(MySQL)]
  S -. "ErroApp" .-> E[Middleware tratarErros<br/>códigos HTTP]
```

| Camada | Arquivos | Responsabilidade |
| --- | --- | --- |
| Routes | `backend/src/rotas/*.ts` | Mapeiam método + caminho para o controller e aplicam o middleware `autenticar` |
| Controllers | `backend/src/controllers/*.ts` | Recebem `req`, chamam o service com `req.body`, `req.params` e `req.usuarioId` e devolvem o status HTTP |
| Services | `backend/src/services/*.ts` | Validam os dados (Zod), aplicam as regras de negócio e usam o Prisma, inclusive em transações |
| Prisma | `backend/src/prisma.ts`, `backend/prisma/schema.prisma` | Cliente do banco, modelos e relacionamentos |
| Middlewares | `backend/src/middlewares/*.ts`, `backend/src/erros.ts` | Autenticação JWT, limite de login e tratamento centralizado de erros |
| Frontend | `src/api.ts`, `src/sessao.ts`, `src/pages`, `src/components` | Chamadas à API, sessão do usuário (token), páginas e componentes |

## Estrutura de diretórios

```
godrive/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            modelos Usuario, Veiculo e Locacao
│   │   ├── migrations/              migrations versionadas do Prisma
│   │   └── seed.ts                  usuários, veículos e locações de exemplo
│   ├── src/
│   │   ├── server.ts                inicia o servidor HTTP
│   │   ├── app.ts                   Express, helmet, CORS, Swagger, rotas e erros
│   │   ├── config.ts                leitura das variáveis de ambiente
│   │   ├── prisma.ts                instância do PrismaClient
│   │   ├── erros.ts                 ErroApp e middleware tratarErros
│   │   ├── formatar.ts              converte registros em JSON (sem senhaHash)
│   │   ├── rotas/                   auth.ts, veiculos.ts, locacoes.ts
│   │   ├── controllers/             authController, veiculoController, locacaoController
│   │   ├── services/                authService, veiculoService, locacaoService
│   │   ├── middlewares/             autenticacao.ts (JWT), limiteLogin.ts
│   │   └── docs/openapi.ts          documentação exibida no Swagger
│   ├── testes/                      testes da API (Vitest + Supertest)
│   ├── .env.example
│   └── package.json
├── public/veiculos/                 imagens dos veículos de exemplo
├── src/
│   ├── api.ts                       cliente HTTP (fetch) com o token JWT
│   ├── sessao.ts                    sessão do usuário (login/logout)
│   ├── useRecurso.ts                hook de carregamento de dados da API
│   ├── types.ts                     tipos compartilhados pela interface
│   ├── App.tsx                      rotas da interface (hash) e proteção de páginas
│   ├── components/                  Header, Footer, CartaoVeiculo, LayoutAuth, Estados, ícones
│   └── pages/                       Login, Cadastro, Catálogo, NovoVeiculo, NovaLocacao, Locacoes
├── index.html
├── vite.config.ts                   proxy de /api para o backend
└── package.json
```

## Modelagem do banco de dados

Definida em [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).

```mermaid
erDiagram
  Usuario ||--o{ Locacao : "realiza"
  Veiculo ||--o{ Locacao : "é locado em"

  Usuario {
    Int id PK
    String nome
    String email UK
    String senhaHash
    DateTime criadoEm "data de cadastro"
    DateTime atualizadoEm
  }

  Veiculo {
    Int id PK
    String marca
    String modelo
    String placa UK
    Int ano
    Decimal valorDiaria
    Boolean disponivel
    String categoria
    String cor "opcional"
    String combustivel "opcional"
    Int lugares
    Int quilometragem
    String imagemUrl "opcional"
    DateTime criadoEm
    DateTime atualizadoEm
  }

  Locacao {
    Int id PK
    Int usuarioId FK
    Int veiculoId FK
    DateTime dataInicio
    DateTime dataPrevistaDevolucao
    DateTime dataDevolucao "opcional: devolução efetiva"
    Decimal valorDiaria "diária no momento da locação"
    Decimal valorTotal
    StatusLocacao status "ATIVA | FINALIZADA"
    DateTime criadoEm
    DateTime atualizadoEm
  }
```

| Requisito do enunciado | Campo no schema |
| --- | --- |
| Usuario: identificador, nome, e-mail único, senha como hash, data de cadastro | `id`, `nome`, `email @unique`, `senhaHash`, `criadoEm` |
| Veiculo: identificador, marca, modelo, placa única, ano, valor da diária, disponibilidade | `id`, `marca`, `modelo`, `placa @unique`, `ano`, `valorDiaria`, `disponivel` |
| Locacao: identificador, usuário, veículo, início, devolução prevista, devolução efetiva (opcional), valor total, status | `id`, `usuarioId`, `veiculoId`, `dataInicio`, `dataPrevistaDevolucao`, `dataDevolucao?`, `valorTotal`, `status` |

Os campos `categoria`, `cor`, `combustivel`, `lugares`, `quilometragem` e `imagemUrl` são usados pela interface para exibir o catálogo. `Locacao.valorDiaria` guarda a diária vigente no momento da locação, para o histórico não mudar se o preço do veículo mudar.

## Relacionamentos

| Relação | Cardinalidade | Chave estrangeira | No schema |
| --- | --- | --- | --- |
| Usuario → Locacao | 1:N | `locacoes.usuarioId` → `usuarios.id` | `Usuario.locacoes Locacao[]` e `Locacao.usuario @relation(fields: [usuarioId], references: [id])` |
| Veiculo → Locacao | 1:N | `locacoes.veiculoId` → `veiculos.id` | `Veiculo.locacoes Locacao[]` e `Locacao.veiculo @relation(fields: [veiculoId], references: [id])` |

As chaves estrangeiras usam `ON DELETE RESTRICT`: um usuário ou veículo com locações não pode ser apagado, o que preserva o histórico. Os dados do veículo são lidos junto com a locação usando `include: { veiculo: true }` em `locacaoService`.

## Endpoints da API

Base: `http://localhost:3333/api`. Todas as respostas são JSON; erros vêm no formato `{ "erro": "mensagem" }`.

| Método | Rota | Protegida | Descrição | Sucesso | Erros |
| --- | --- | :---: | --- | :---: | --- |
| POST | `/auth/register` | — | Cadastra usuário (`nome`, `email`, `senha`) | 201 | 400, 409 |
| POST | `/auth/login` | — | Verifica credenciais e retorna `{ token, usuario }` | 200 | 400, 401, 429 |
| GET | `/auth/me` | ✔ | Dados do usuário identificado pelo token | 200 | 401 |
| POST | `/veiculos` | ✔ | Cadastra veículo | 201 | 400, 401, 409 |
| GET | `/veiculos` | ✔ | Lista veículos com a disponibilidade (filtros opcionais `?disponivel=true\|false`, `?busca=`, `?categoria=`) | 200 | 401 |
| GET | `/veiculos/disponiveis` | ✔ | Lista apenas os veículos disponíveis | 200 | 401 |
| POST | `/locacoes` | ✔ | Registra locação (`veiculoId`, `dataInicio`, `dataPrevistaDevolucao`) | 201 | 400, 401, 404, 409 |
| GET | `/locacoes` | ✔ | Locações do usuário logado, ativas e finalizadas (filtro opcional `?status=ATIVA\|FINALIZADA`) | 200 | 400, 401 |
| PATCH | `/locacoes/:id/finalizar` | ✔ | Finaliza a locação, registra a devolução e libera o veículo | 200 | 400, 401, 404, 409 |
| GET | `/saude` | — | Verificação simples de funcionamento | 200 | — |

Significado dos códigos: **400** dados inválidos, **401** sem token/token inválido/credenciais erradas, **404** recurso inexistente (ou locação de outro usuário), **409** conflito (e-mail/placa duplicados, veículo indisponível, locação já finalizada), **429** muitas tentativas de login.

A documentação interativa (Swagger) fica em **http://localhost:3333/api/docs**: faça login, clique em **Authorize**, cole o token e execute as rotas pelo navegador.

## Autenticação e segurança

1. **Cadastro** (`authService.cadastrar`): valida os dados, verifica se o e-mail já existe e grava `bcrypt.hash(senha, 10)` em `senhaHash`. A senha em texto puro nunca é salva.
2. **Login** (`authService.login`): busca o usuário pelo e-mail e compara a senha com `bcrypt.compare`. Se estiver certa, `gerarToken` assina um JWT com `sub = id do usuário` e validade `JWT_EXPIRES_IN`. A mensagem de erro é a mesma para e-mail inexistente e senha errada.
3. **Rotas protegidas**: o middleware `autenticar` lê `Authorization: Bearer <token>`, verifica a assinatura com `jwt.verify` e coloca o id em `req.usuarioId`. Sem token ou com token inválido/expirado, responde **401**.
4. **Identificação pelo token**: os controllers usam sempre `req.usuarioId`. Um `usuarioId` enviado no corpo da requisição é ignorado.
5. **Locações de terceiros**: `listar` filtra por `usuarioId`, e `finalizar` busca com `findFirst({ where: { id, usuarioId } })`. A locação de outra pessoa responde **404**, sem revelar que existe.
6. **Sem dados sensíveis nas respostas**: `formatarUsuario` monta o JSON só com `id`, `nome`, `email` e `criadoEm`; o `senhaHash` nunca sai da API.
7. **Proteções adicionais**: helmet (cabeçalhos HTTP), CORS restrito à origem do frontend e limite de 20 tentativas de login a cada 15 minutos por IP.

No frontend, o token fica em `sessionStorage` (ou `localStorage` com "Lembrar-me"), é enviado por `src/api.ts` em todas as requisições e é descartado no logout ou quando a API responde 401.

## Regras de negócio

| # | Regra | Onde está |
| --- | --- | --- |
| 1 | Só usuários autenticados gerenciam veículos e locações | `rotasVeiculos.use(autenticar)` e `rotasLocacoes.use(autenticar)` |
| 2 | Um veículo não pode ter duas locações ativas; ao iniciar, fica indisponível | `locacaoService.registrar`: `updateMany({ where: { id, disponivel: true }, data: { disponivel: false } })` + `count` de locações `ATIVA`, dentro de `prisma.$transaction` |
| 3 | A locação fica ativa até a devolução; a devolução encerra e libera o veículo | `locacaoService.finalizar`: `status: 'FINALIZADA'`, `dataDevolucao: new Date()` e `disponivel: true` na mesma transação |
| 4 | Não é permitido finalizar uma locação já finalizada | `updateMany({ where: { id, status: 'ATIVA' } })` → se `count === 0`, **409** |
| 5 | A data prevista de devolução deve ser posterior à data de início | `locacaoService.registrar` → **400**; a data de início também não pode estar no passado |
| 6 | Valor calculado no backend; fração de 24 h conta como diária completa | `calcularDiarias` usa `Math.ceil((fim - início) / 24 h)`; `valorTotal = valorDiaria × diárias` |
| 7 | Usuário só consulta e finaliza as próprias locações; o id vem do token | `req.usuarioId` + filtros por `usuarioId` |
| 8 | Placas e e-mails únicos; não há locação de veículo inexistente | `@unique` no schema + verificação nos services (**409**); veículo inexistente → **404** |
| 9 | Histórico preservado | Não existem rotas de exclusão; finalizar só muda `status` e `dataDevolucao`; FKs com `RESTRICT` |
| 10 | Consistência em requisições simultâneas | Transações do Prisma + atualizações condicionais atômicas (ver abaixo) |

**Concorrência.** No registro, o `UPDATE veiculos SET disponivel = false WHERE id = ? AND disponivel = true` é atômico no MySQL (InnoDB): a primeira transação trava a linha do veículo e as outras esperam. Quando a primeira confirma, as seguintes encontram `disponivel = false`, afetam 0 linhas e recebem **409**. Se qualquer passo falhar, a transação inteira é desfeita e o veículo não fica preso como indisponível. A finalização usa a mesma ideia (`WHERE status = 'ATIVA'`), então duas finalizações simultâneas resultam em um **200** e um **409**. Os dois casos têm testes automatizados com requisições em paralelo.

## Decisões técnicas e limitações

- **TypeScript nos dois lados**, para que os tipos ajudem a manter frontend e backend coerentes.
- **Zod nos services** valida e converte as entradas; os erros viram **400** com mensagem clara no middleware `tratarErros`.
- **Datas com horário** (`DATETIME`): necessário para a regra "fração de 24 horas = diária completa". A interface usa `datetime-local` e envia as datas em ISO 8601; a API aceita qualquer data ISO 8601.
- **Tolerância de 5 minutos** na data de início, para que uma locação "para agora" não seja recusada pelo tempo entre preencher e enviar o formulário.
- **Valor da diária copiado para a locação**, para o histórico não mudar se o preço do veículo for alterado.
- **Erros genéricos no login**: a mesma mensagem para e-mail inexistente e senha errada, para não revelar quais e-mails têm conta.
- **Sem papéis de usuário**: o enunciado pede apenas usuários autenticados, então qualquer usuário logado pode cadastrar veículos.
- **Limitações conhecidas**: não há edição/exclusão (fora do escopo pedido); não há recuperação de senha nem confirmação de e-mail; o valor é o contratado (o atraso na devolução não gera cobrança extra, porque o enunciado calcula sobre a duração contratada); é possível finalizar uma locação antes da data de início, o que funciona como encerramento antecipado com o valor contratado.

## Pré-requisitos

- **Node.js 20.12 ou superior** (testado com Node 22) e npm.
- **MySQL 8** (ou MariaDB 10.5+) rodando localmente.
- Git.

## Instalação do backend

```bash
git clone https://github.com/carlos0ff/godrive.git
cd godrive/backend
npm install
```

O `npm install` também gera o Prisma Client (script `postinstall`).

## Configuração do MySQL

Crie o banco da aplicação e, se quiser rodar os testes, um banco separado para eles. Exemplo com um usuário próprio para o projeto:

```sql
CREATE DATABASE godrive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE godrive_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'godrive'@'localhost' IDENTIFIED BY 'escolha-uma-senha';
GRANT ALL PRIVILEGES ON godrive.* TO 'godrive'@'localhost';
GRANT ALL PRIVILEGES ON godrive_test.* TO 'godrive'@'localhost';
FLUSH PRIVILEGES;
```

Também é possível usar o usuário `root`, se ele tiver senha e acesso por TCP.

## Configuração do Prisma

1. Copie o arquivo de exemplo e preencha com os seus dados:

   ```bash
   cp .env.example .env
   ```

2. Ajuste `DATABASE_URL` no formato `mysql://USUARIO:SENHA@HOST:PORTA/BANCO` e defina um `JWT_SECRET` longo e aleatório. Para gerar um:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

O schema fica em `backend/prisma/schema.prisma` e as migrations em `backend/prisma/migrations/`.

## Arquivo .env.example

```env
DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/godrive"
JWT_SECRET="troque-por-uma-chave-longa-e-aleatoria"
JWT_EXPIRES_IN="1d"
PORT=3333
LOGIN_RATE_LIMIT=20
CORS_ORIGIN="http://localhost:5173"
TEST_DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/godrive_test"
```

| Variável | Uso |
| --- | --- |
| `DATABASE_URL` | Conexão do Prisma com o MySQL |
| `JWT_SECRET` | Chave usada para assinar e validar os tokens |
| `JWT_EXPIRES_IN` | Validade do token (ex.: `1d`, `8h`) |
| `PORT` | Porta da API (padrão 3333) |
| `LOGIN_RATE_LIMIT` | Tentativas de login permitidas a cada 15 minutos |
| `CORS_ORIGIN` | Origem do frontend autorizada a chamar a API |
| `TEST_DATABASE_URL` | Banco usado somente pelos testes (precisa ter "test" no nome) |
| `HOST` | Interface em que a API escuta (`127.0.0.1` atrás de proxy) |
| `TRUST_PROXY` | `true` quando há nginx na frente, para o limite de login usar o IP real |
| `API_PUBLIC_PATH` | Caminho público da API, usado pelo Swagger (ex.: `/projeto/demo/godrive/api`) |

O arquivo `.env` real está no `.gitignore` e não deve ser versionado.

## Execução das migrations

```bash
cd backend
npm run db:deploy   # aplica as migrations existentes (prisma migrate deploy)
npm run db:seed     # cria os dados de exemplo
```

Durante o desenvolvimento, para criar uma nova migration depois de alterar o `schema.prisma`, use `npm run db:migrate` (`prisma migrate dev`).

O seed cria:

| Dado | Detalhes |
| --- | --- |
| Usuário `cliente@godrive.com` / senha `cliente123` | Possui uma locação **finalizada** (Fiat Argo) e uma **ativa** (Fiat Pulse) |
| Usuário `maria@godrive.com` / senha `maria123` | Sem locações (útil para mostrar o bloqueio de acesso a locações de outro usuário) |
| 10 veículos | Hatch, sedã, SUV, picape e minivan; o Fiat Pulse fica indisponível por causa da locação ativa |

## Inicialização do backend

```bash
cd backend
npm run dev     # desenvolvimento, com recarga automática (tsx watch)
```

A API sobe em `http://localhost:3333/api` e o Swagger em `http://localhost:3333/api/docs`. Para produção: `npm run build` e depois `npm start`.

## Inicialização do frontend

Em outro terminal, na raiz do repositório:

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`. O Vite encaminha as chamadas de `/api` para `http://localhost:3333` (configurado em `vite.config.ts`). Se a API estiver em outro endereço, defina `API_URL` antes de `npm run dev` ou `VITE_API_URL` no build.

Para publicar em um subcaminho, gere o build com `VITE_BASE` e `VITE_API_URL`:

```bash
VITE_BASE=/projeto/demo/godrive/ VITE_API_URL=/projeto/demo/godrive/api npm run build
```

A versão de demonstração está em **https://carlos0ff.dev/projeto/demo/godrive/** (nginx servindo o `dist/` e encaminhando `/api/` para a API em um serviço systemd).

## Exemplos de utilização

Os exemplos usam `curl`; os mesmos passos podem ser feitos pelo Swagger.

**Cadastro**

```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Ana Souza","email":"ana@email.com","senha":"segredo1"}'
```

```json
{ "mensagem": "Conta criada com sucesso.", "usuario": { "id": 3, "nome": "Ana Souza", "email": "ana@email.com", "criadoEm": "2026-11-19T01:40:51.956Z" } }
```

**Login**

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@godrive.com","senha":"cliente123"}'
```

```json
{ "token": "eyJhbGciOiJIUzI1NiIs...", "usuario": { "id": 1, "nome": "Cliente Demonstração", "email": "cliente@godrive.com", "criadoEm": "..." } }
```

**Veículos disponíveis** (substitua `TOKEN` pelo token recebido)

```bash
curl http://localhost:3333/api/veiculos/disponiveis -H "Authorization: Bearer TOKEN"
```

**Cadastrar veículo**

```bash
curl -X POST http://localhost:3333/api/veiculos \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"marca":"Renault","modelo":"Kwid","placa":"KWD-1A23","ano":2024,"valorDiaria":79.9,"categoria":"Hatch"}'
```

**Registrar locação** — 2 dias e 2 horas contam como 3 diárias:

```bash
curl -X POST http://localhost:3333/api/locacoes \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"veiculoId":7,"dataInicio":"2026-12-01T10:00:00-03:00","dataPrevistaDevolucao":"2026-12-03T12:00:00-03:00"}'
```

```json
{ "id": 3, "status": "ATIVA", "valorDiaria": 99.9, "valorTotal": 299.7, "dataDevolucao": null, "veiculo": { "placa": "STU-7J89", "disponivel": false, "...": "..." } }
```

Repetir a mesma requisição para o mesmo veículo responde **409** `Este veículo não está disponível para locação.`

**Listar e finalizar**

```bash
curl http://localhost:3333/api/locacoes -H "Authorization: Bearer TOKEN"
curl -X PATCH http://localhost:3333/api/locacoes/3/finalizar -H "Authorization: Bearer TOKEN"
```

Finalizar de novo responde **409**; tentar finalizar com o token de outro usuário responde **404**.

## Testes automatizados

```bash
cd backend
npm test
```

São 14 testes (Vitest + Supertest) executados no banco `TEST_DATABASE_URL`, que é limpo antes de cada teste. Eles cobrem: cadastro e login sem expor o hash, e-mail duplicado, credenciais erradas, rotas sem token ou com token inválido, cadastro de veículo com placa duplicada e diária inválida, listagem e veículos disponíveis, cálculo das diárias com frações, registro de locação, validação de datas, veículo inexistente e indisponível, **5 locações simultâneas do mesmo veículo** (apenas 1 aceita), acesso a locações de outro usuário, finalização, histórico, **duas finalizações simultâneas** e identificador inválido.

## Roteiro de demonstração

Passos sugeridos para a apresentação:

1. Subir backend e frontend e abrir o Swagger.
2. `POST /auth/register` e `POST /auth/login` → copiar o token e clicar em Authorize.
3. `GET /veiculos` e `GET /veiculos/disponiveis` (o Pulse aparece indisponível).
4. `POST /locacoes` → mostrar o `valorTotal` calculado e tentar alugar o mesmo carro (409).
5. `GET /locacoes` e `PATCH /locacoes/:id/finalizar` → finalizar de novo (409).
6. Repetir o fluxo na interface React: login, catálogo com filtro, nova locação, minhas locações e finalização.

## Integrantes

| Nome | GitHub |
| --- | --- |
| Genilson Pereira | — |
| José Carlos | [@carlos0ff](https://github.com/carlos0ff) |
| Matheus Henrique | — |

## Informações acadêmicas

| Item | Informação |
| --- | --- |
| Disciplina | Programação com Frameworks Web |
| Atividade | Atividade Prática — Sistema de Locação de Veículos |
| Conteúdo | API REST, Prisma, Autenticação e React |
| Modalidade | Grupo de até 4 alunos |
| Entrega coletiva | Este repositório (backend, frontend, `schema.prisma`, migrations, README e `.env.example`) |
| Entrega individual | DER, diagrama de sequência e respostas às cinco questões, manuscritos em A4 branco, entregues fisicamente ao professor |
