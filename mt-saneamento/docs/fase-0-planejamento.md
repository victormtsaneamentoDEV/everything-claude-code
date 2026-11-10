# MT Saneamento — Fase 0: Planejamento

> Status: **respondido em 10/11/2026** — decisões consolidadas em [`decisoes.md`](decisoes.md).
> Fonte: `prompt_sistema_mt_saneamento.md` (contexto, regras, requisitos, fases).

---

## 1. Perguntas antes de codar (10)

1. **Preço na proposta com/sem IPI.** O custo vem COM IPI e o preço é `ceil(custo × 1,6)`. Na proposta o preço aparece "sem IPI". Qual é a conta?
   - (a) `preço sem IPI = ceil(custo_com_IPI × 1,6) ÷ (1 + alíquota)` e o IPI aparece destacado, ou
   - (b) `preço sem IPI = ceil(custo_sem_IPI × 1,6)` e o IPI é somado por fora?
   Um exemplo real de proposta (custo → preço → IPI → total) resolve.
2. **Alíquota de IPI.** Ela é por produto (NCM), por marca ou fixa? Os 3,25% da Angolini são a única exceção? Quanto é para PAM?
3. **Consumo × revenda.** O que muda na proposta quando é consumo e quando é revenda (destaque de IPI, texto do rodapé, ICMS-ST, outra coisa)?
4. **Custo por marca.** O mesmo produto pode ter custo diferente por marca (PAM × Angolini). Posso guardar o custo **por produto + marca**, com o "valor unitário" do produto sendo o da marca principal? E qual a marca padrão ao orçar (PAM?)?
5. **Reserva e baixa.** Confirmo a proposta:
   - aprovar orçamento (→ Vendido) **reserva** o estoque;
   - marcar **Enviado** faz a **baixa** (o "Confirmado" só valida).
   Também: em venda a prazo ou para órgão público, a etapa **Pago** pode vir depois de Enviado/Entregue ou ser pulada?
6. **Arquivos-fonte.** Preciso de:
   - link/ID da Google Sheet atual (consigo ler pelo conector do Google Sheets);
   - "Modelo Proposta MT Saneamento" (xlsx ou PDF) e 2 ou 3 propostas reais em PDF;
   - "ORÇAMENTOS - NOVO MODELO - MARCO - 2.xlsx";
   - um xls de cada tabela de fornecedor (PAM CIF-MT, PAM FOB-MT, Angolini).
7. **Tubos fabricados.** Eles entram no controle de estoque (com marca "MT"/própria) ou são só itens de orçamento sob encomenda? Como se calcula o custo deles (tabela fixa, fórmula por DN/comprimento)?
8. **Inscrição estadual.** Não existe API pública gratuita e estável do Sintegra para todas as UFs. Opções:
   - (a) consulta paga via API de CNPJ que já devolve a IE (custo de alguns centavos por consulta), ou
   - (b) busca do CNPJ grátis (razão social e endereço) + IE digitada, com botão que abre o Sintegra da UF.
   Qual prefere?
9. **Notificações e envio.** Para avisar cada etapa do pedido: notificação no app/PWA + e-mail é suficiente? Para o WhatsApp, um link `wa.me` com o PDF/link da proposta (grátis) atende, ou quer a API oficial do WhatsApp (paga, mais burocrática)?
10. **Hospedagem e repositório.** Este repositório (`everything-claude-code`) é de configuração do Claude Code. Posso criar um **repositório novo** (ex.: `mt-saneamento-sistema`)? Contas Vercel + Supabase no nome da empresa, plano gratuito no início (~US$ 0–25/mês), tudo bem? Quem será Admin além de você? O Marco vê custo e margem?

---

## 2. Arquitetura proposta

| Camada | Escolha | Por quê |
|---|---|---|
| Front + API | **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui** | Um projeto só (telas + server actions), PWA, ótimo em celular |
| Banco/Auth | **Supabase** (PostgreSQL + Auth e-mail/Google + RLS + Storage) | Permissão por papel **no banco** (RLS), backup gerenciado, barato |
| Regras críticas | **Funções SQL/transações no Postgres** (reservar, baixar, numerar) | Atômico: dois vendedores não pegam o mesmo número nem o mesmo saldo |
| PDF | **HTML/CSS → PDF com Chromium headless** (rota de servidor) | Maior fidelidade ao modelo atual; o mesmo template serve para relatórios |
| Importação | `SheetJS (xlsx)` para xls/xlsx/csv | Lê xls antigo (PAM) e xlsx |
| Validação | `zod` compartilhado front/back | Mesma regra no formulário e no servidor |
| Offline | Service Worker + IndexedDB: cache de catálogo/saldos e **fila de lançamentos** | Estoque na rua com 4G ruim |
| Testes | **Vitest** (regras puras), **pgTAP/SQL** (funções do banco), **Playwright** (fluxos e PDF) | Critério de aceite testável |
| Deploy | Vercel (app) + Supabase (BD) + GitHub Actions (CI, backup diário xlsx/dump no Storage) | Custo baixo, sem servidor para cuidar |

**Princípios:**
- **Estoque é razão (ledger):** nada guarda "saldo" editável. O saldo é a soma das movimentações imutáveis. Correção = movimento de ajuste com motivo.
- **Snapshot no orçamento:** o item guarda descrição, custo, multiplicador e preço do momento. Mudar a tabela depois não altera proposta já enviada.
- **Exclusão lógica + auditoria por trigger** em todas as tabelas de negócio.
- **Dinheiro em `numeric`** (nunca float), arredondamento em uma única função testada.
- Numeração `2.206` = inteiro `2206` exibido no formato pt-BR. Gerada por sequência no banco, inicializada com o maior número importado + 1, e pode ser informada à mão se ainda não existir.

---

## 3. Modelo de dados (principais tabelas)

```
perfis(id → auth.users, nome, papel[admin|vendas|estoque|logistica|leitura], ativo)

marcas(id, nome, ativa)                       -- PAM, Angolini, Fanuel, INAPI, Sem marca…
categorias(id, nome)                          -- ~50 famílias
produtos(id, codigo_legado, codigo_sap, categoria_id, descricao, unidade[UN|M|MM],
         tipo, modelo, dn, ativo, em_revisao, obs_revisao, estoque_minimo=5,
         aliquota_ipi, multiplicador_override, deleted_at)
custos(id, produto_id, marca_id, custo_com_ipi, origem_tabela_item_id, vigente_desde, usuario_id)
regras_multiplicador(escopo[global|marca|produto], marca_id?, produto_id?, multiplicador)

fornecedores(id, nome)
tabelas_preco(id, fornecedor_id, modalidade[CIF|FOB|UNITARIO], arquivo, importada_em, usuario_id)
tabelas_preco_itens(id, tabela_id, codigo_fornecedor, descricao, preco_sem_ipi, ipi, preco_com_ipi, produto_id?)

movimentos(id, produto_id, marca_id, tipo[INICIAL|ENTRADA|SAIDA|AJUSTE|TRANSF_SAIDA|TRANSF_ENTRADA],
           quantidade>0, motivo, documento(NF), pedido_id?, caixa_id?, inventario_id?,
           status[pendente|conferido], usuario_id, criado_em)
caixas(id, data, aberto_por, fechado_por, conferido_por, status)        -- "abrir e fechar caixa"
reservas(id, pedido_item_id, produto_id, marca_id, quantidade, status[ativa|baixada|cancelada])
inventarios(id, inicio, fim, status) / inventario_contagens(inventario_id, produto_id, marca_id, contado, sistema)

v_saldos(produto_id, marca_id, saldo, reservado, disponivel)            -- view
v_produto_status(produto_id, saldo_total, valor_total, status[OK|REPOR|ZERADO], negativo bool)

clientes(id, cnpj, razao_social, fantasia, ie, contribuinte, endereco…, contato, email, telefone)

tubos_fabricados(id, dn, classe, comprimento, aplicacao[AGUA|ESGOTO], descricao, custo)

orcamentos(id, numero, versao, orcamento_raiz_id, atual bool, cliente_id, vendedor_id, data,
           validade, cond_pagamento, frete[CIF|FOB], finalidade[consumo|revenda], status,
           observacoes, nome_registro "CLIENTE - DD.MM.AA")
orcamento_itens(id, orcamento_id, ordem, produto_id? | tubo_fabricado_id?, marca_id,
                descricao, unidade, quantidade, custo_snapshot, multiplicador, preco_unitario,
                aliquota_ipi, prazo_entrega)

pedidos(id, orcamento_id, etapa[orcado|vendido|conferencia|confirmado|pago|enviado|rastreio|entregue|cancelado],
        responsavel_id, prazo, codigo_rastreio, transportadora)
pedido_eventos(id, pedido_id, de, para, usuario_id, comentario, criado_em)   -- linha do tempo
notificacoes(id, usuario_id, tipo, link, lida)

auditoria(id, tabela, registro_id, acao, antes jsonb, depois jsonb, usuario_id, criado_em)
configuracoes(chave, valor)                    -- multiplicador padrão 1,6, textos do rodapé…
```

**RLS (resumo):**

| Papel | Pode fazer |
|---|---|
| admin | Tudo |
| vendas | Catálogo, custo/margem, clientes, orçamentos, pedidos (vê o estoque) |
| estoque | Movimentos, caixas, inventário, conferência de pedidos. **Sem custo/margem** (colunas ocultas por view) |
| logistica | Pedidos a partir de `confirmado`, rastreio. Sem custo |
| leitura | Só visualiza o dashboard e os relatórios |

---

## 4. Telas

Navegação inferior: **Dashboard · Estoque · Orçamentos · Pedidos · Mais**

- **Dashboard:** cartões (valor em estoque, zerados, abaixo do mínimo, propostas abertas, taxa de aprovação), barras por categoria, rosca de status, pedidos por etapa. **Visão do chefe**, só leitura.
- **Estoque:**
  - lista com busca, filtros e chips de status;
  - ficha do produto (saldo por marca, histórico);
  - **Lançar** (entrada/saída em ≤ 4 toques: produto → marca → qtd → confirmar);
  - caixa do dia (lote e conferência pelo Leandro);
  - inventário;
  - transferência entre marcas.
- **Orçamentos:**
  - lista e busca;
  - editor (cliente, itens com custo/margem/preço, importar planilha, tubo fabricado, regra K7→K9);
  - prévia do PDF;
  - enviar (e-mail, WhatsApp);
  - versões;
  - aprovar.
- **Pedidos:** Kanban por etapa + lista; detalhe com linha do tempo, responsável, prazo, rastreio e comentários.
- **Mais:**
  - Catálogo e **Pendências** (sem valor, em revisão, sem mínimo);
  - Tabelas de fornecedores (importar, comparar, aplicar);
  - Clientes;
  - Relatórios;
  - Usuários/Papéis;
  - Configurações;
  - Auditoria;
  - Exportar/Backup.

---

## 5. Plano em marcos (cada um termina com algo utilizável + testes + seu ok)

| Fase | Entrega | Testes-chave |
|---|---|---|
| **1 — Base** | Projeto, Supabase, login e papéis/RLS, catálogo (CRUD, filtros, pendências), **script de migração idempotente** da Google Sheet com relatório (entrou, rejeitado, 212 sem valor) | RLS por papel; idempotência do import; contagem de produtos = planilha |
| **2 — Estoque** | Saldos por marca, lançar E/S/ajuste/transferência, alerta de negativo, caixa do dia, inventário, histórico | Saldo = inicial + E − S por marca; negativo gera alerta; frações só em M/MM; **saldo total ≈ 17.296 e valor ≈ R$ 2,09 mi batem** |
| **3 — Preços e orçamentos** | Import das tabelas PAM/Angolini com diff e "aplicar custo", multiplicador global/marca/produto, editor de orçamento, numeração, versões, **PDF idêntico**, envio | `ceil(custo × 1,6)`; exceções; numeração (maior + 1, concorrência); nome do arquivo e do registro; K7→K9 |
| **4 — Pedidos** | Kanban, linha do tempo, notificações, aprovar → reserva, enviado → baixa (automática) | Reserva/baixa/cancelamento; sem baixa dupla; permissões por etapa |
| **5 — Dashboard e relatórios** | Operacional + chefe; PDFs (estoque por categoria em paisagem, resumo, movimentações, inventário, compra sugerida) e Excel | Totais do dashboard = relatórios = migração |
| **6 — Acabamento** | PWA/offline com fila, busca global, código de barras, backup diário, docs e guia rápido por papel | Playwright mobile: entrada/saída em < 5 toques; PDF em < 3 min |

**Riscos já mapeados:**
- Fidelidade do PDF depende de receber o modelo original.
- A IE não tem fonte gratuita confiável.
- Contagem física em andamento: o estoque inicial pode mudar. O import idempotente permite reimportar sem duplicar.
- Os 165 produtos em revisão vão para a fila de pendências e não bloqueiam o uso.
