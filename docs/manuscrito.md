# Guia do manuscrito (versão curta)

> Guia de apoio. A entrega é **à mão**, em **A4 branca sem pauta**, com **nome completo** em cada folha. Cada integrante escreve com as próprias palavras.

Integrantes: Genilson Pereira · José Carlos · Matheus Henrique

Folhas: **1** DER (A4 deitada) · **2** diagrama de sequência (A4 deitada) · **3** respostas A–E.

---

## 1. DER

```
 USUARIO                         VEICULO
 PK id                           PK id
    nome                            marca, modelo, ano
 UK email                        UK placa
    senhaHash                       valorDiaria
    criadoEm                        disponivel
     │ 1                                 │ 1
     │                                   │
     │ N            LOCACAO            N │
     └──────── PK id ────────────────────┘
               FK usuarioId → usuarios.id
               FK veiculoId → veiculos.id
                  dataInicio
                  dataPrevistaDevolucao
                  dataDevolucao (opcional)
                  valorDiaria, valorTotal
                  status: ATIVA | FINALIZADA
```

Precisa aparecer: PK nas três, FK em `usuarioId` e `veiculoId`, UK em `email` e `placa`, **1:N** nos dois relacionamentos.

---

## 2. Diagrama de sequência — registro de locação

Participantes: **Usuário · React · Route/Controller · Service · Prisma/BD**

```
Usuário  → React       : escolhe veículo e datas, clica em Confirmar
React    → Route/Ctrl  : POST /api/locacoes + Bearer token
Route    → Route       : autenticar (jwt.verify) → req.usuarioId
Ctrl     → Service     : locacaoService.registrar(usuarioId, dados)
Service  → Service     : valida datas e calcula diárias (Math.ceil)
Service  → BD          : $transaction: findUnique(veiculo)
Service  → BD          : updateMany(disponivel: true → false)
  alt veículo indisponível (count = 0)
    Service → Ctrl → React : 409 "veículo não está disponível"
    React   → Usuário      : mostra o erro
  senão
    Service → BD           : locacao.create(valorTotal)
    Ctrl    → React        : 201 + locação
    React   → Usuário      : mostra valor calculado e atualiza a lista
```

Desenhe linhas de vida verticais, setas cheias para chamadas e tracejadas para respostas, e uma caixa **alt** para o caso indisponível.

---

## 3. Respostas

**A) Route, Controller e Service**
A Route (`rotas/locacoes.ts`) só liga `POST /api/locacoes` ao middleware `autenticar` e ao `locacaoController.registrar`. O Controller lê `req.usuarioId` e `req.body`, chama o service e responde 201. O `locacaoService.registrar` tem as regras: valida as datas, calcula as diárias, verifica a disponibilidade e grava a locação pelo Prisma. Assim cada parte tem uma única função.

**B) Relacionamentos 1:N no Prisma**
`Usuario` e `Veiculo` têm o campo `locacoes Locacao[]` (lado 1). `Locacao` guarda as FKs `usuarioId` e `veiculoId` com `@relation(fields: [usuarioId], references: [id])` (lado N). A migration criou as `FOREIGN KEY`. Exemplo: `prisma.locacao.findMany({ where: { usuarioId }, include: { veiculo: true } })` traz cada locação com os dados do carro.

**C) Login e JWT**
O `authService.login` busca o usuário pelo e-mail e compara a senha com `bcrypt.compare`. Se estiver certa, `gerarToken` cria o JWT com o id do usuário. O front envia `Authorization: Bearer <token>` e o middleware `autenticar` valida com `jwt.verify`, ou responde 401. O bcrypt guarda só o hash com salt, então a senha não pode ser lida no banco. A resposta não traz a senha nem o hash (`formatarUsuario`), porque é um dado sensível.

**D) Duas locações ativas e requisições simultâneas**
Dentro de `prisma.$transaction`, o service faz `updateMany` com a condição `disponivel: true` e muda para `false`. Esse UPDATE é atômico: se duas requisições chegam juntas, só a primeira altera a linha; a segunda recebe `count = 0` e retorna 409. Se algo falhar, a transação é desfeita. Testamos com 5 requisições ao mesmo tempo: só 1 foi aceita.

**E) Formulário React**
A `NovaLocacaoPage` guarda veículo e datas com `useState`, e os campos usam `value` e `onChange`. No `onSubmit`, a função `enviar` chama `preventDefault()` e `api.criarLocacao`, que faz o `fetch` com o token. Se der certo, `setConfirmada` mostra o valor calculado pelo backend e `recarregar()` atualiza a lista de veículos disponíveis. Se der erro, `setErro` mostra a mensagem.
