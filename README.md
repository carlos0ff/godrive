# goDrive

Frontend de uma locadora de veículos em **React + TypeScript + Vite**, com CSS próprio
e sem dependências além de `react`/`react-dom`.

O app é **somente frontend**: não há backend, login, chamadas de rede nem dados salvos.
O catálogo e o exemplo de locação são fixos (`src/catalogo.ts`). Os formulários validam
os campos e mostram uma confirmação, mas nada é gravado.

## Como rodar

```bash
npm install
npm run dev
```

Outros comandos: `npm run build` (typecheck + build), `npm run preview` e `npm run lint`.

## Páginas

| Rota                | O que faz                                                            |
| ------------------- | -------------------------------------------------------------------- |
| `#/`                | Herói, benefícios e catálogo de veículos                              |
| `#/veiculos`        | Catálogo com busca, filtro por categoria, disponibilidade, ordenação e paginação |
| `#/login`           | Formulário de login (só validação)                                    |
| `#/cadastro`        | Formulário de criação de conta (só validação)                         |
| `#/veiculos/novo`   | Formulário de cadastro de veículo (só validação)                      |
| `#/locacoes`        | Exemplo de histórico de locações                                      |
| `#/locacoes/nova`   | Escolha do veículo, datas e valor estimado                            |

A navegação é por hash (`#/rota`), tratada direto em `src/App.tsx`, e funciona em
qualquer hospedagem estática.

## Estrutura

```
src/
  App.tsx     navegação por hash e escolha da página
  catalogo.ts veículos e locação de exemplo (fixos)
  components/ cabeçalho, rodapé, cartão de veículo, estado vazio, ícones SVG
  pages/      uma página por rota
```
