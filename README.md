# goDrive

Frontend de uma locadora de veículos em **React + TypeScript + Vite**, com CSS próprio
e sem dependências além de `react`/`react-dom`.

O app é **somente frontend**: não há backend nem chamadas de rede. O catálogo, a sessão
e as locações vêm de `src/dados/` e o que você cria fica salvo no `localStorage` do
navegador.

Qualquer e-mail entra (senha com ao menos 4 caracteres); e-mails começando com `admin`
recebem o papel de administrador e veem o cadastro de veículos.

## Como rodar

```bash
npm install
npm run dev
```

Outros comandos: `npm run build` (typecheck + build), `npm run preview` e `npm run lint`.

## Páginas

| Rota                | Acesso        | O que faz                                                            |
| ------------------- | ------------- | -------------------------------------------------------------------- |
| `#/`                | público       | Herói, benefícios e catálogo de veículos                              |
| `#/veiculos`        | público       | Catálogo com busca, filtro por categoria, disponibilidade, ordenação e paginação |
| `#/login`           | público       | Autenticação; redireciona para a página pretendida (`?redir=`)        |
| `#/cadastro`        | público       | Criação de conta com validação no cliente                             |
| `#/veiculos/novo`   | **admin**     | Formulário de cadastro de veículo                                     |
| `#/locacoes`        | autenticado   | Histórico de locações, valores e finalização                          |
| `#/locacoes/nova`   | autenticado   | Escolha do veículo, datas, valor estimado e registro                  |

O roteamento é por hash (`#/rota`), implementado em `src/router/` — funciona em qualquer
hospedagem estática, sem configuração de servidor.

Para zerar os dados de demonstração, apague a chave `godrive:dados` do `localStorage`.

## Estrutura

```
src/
  dados/      catálogo de demonstração e operações locais (localStorage)
  components/ cabeçalho, rodapé, cartão de veículo, avisos, estados, ícones SVG
  context/    autenticação e mensagens de sucesso/erro
  pages/      uma página por rota
  router/     roteador por hash e componente de link
  utils/      formatação de moeda, data e cálculo de diárias
```
