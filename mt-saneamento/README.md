# Sistema MT Saneamento

Estoque, orçamentos e pedidos da MT Saneamento (V E Gomes Araújo Ltda.).

> Pasta provisória. O sistema vai para um repositório próprio (`mt-saneamento-sistema`) assim que ele for criado.

| Pasta | O que é |
|---|---|
| `docs/fase-0-planejamento.md` | Arquitetura, modelo de dados, telas e fases |
| `docs/decisoes.md` | Respostas do Victor, achados nas planilhas e o que ainda falta |
| `regras/` | Regras de negócio em TypeScript com testes: preço, IPI, arredondamento, numeração, nomes de arquivo, tubos fabricados, K7→K9, CNPJ, saldo por marca |
| `assets/` | Logotipos |

## Rodar os testes das regras

```bash
cd regras
npm install
npm test
```

O teste `regras/test/proposta-real.test.ts` reproduz, centavo a centavo, a proposta real enviada à Brasil Infra em 22/10/26 (26 itens, R$ 61.040,00).
