# Decisões — respostas do Victor (10/11/2026)

Legenda: ✅ decidido · ⚠️ decidido, mas os dados mostram algo diferente (confirmar) · ❓ ainda falta

## Preço e IPI
- ✅ **Fórmula (a)**: `preço com IPI = ARRED.PARA.CIMA(custo com IPI × multiplicador)` em reais inteiros; `preço sem IPI = preço com IPI ÷ (1 + IPI)`.
  - **Conferida centavo a centavo** contra a proposta real nº 2 (Brasil Infra, 22/10/26, total R$ 61.040,00) em `regras/test/proposta-real.test.ts`.
- ✅ **Multiplicador editável no item** (desconto). O sistema avisa quando o preço fica abaixo do custo.
- ✅ Arredondamento no **preço unitário**. Total do item = unitário × quantidade.
- ⚠️ **Base do 1,6:** a aba `Configuracoes` do AppSheet diz *"ROUNDUP(custo **sem** IPI × multiplicador)"*, mas a resposta e o prompt dizem custo **com** IPI. Sigo **com IPI**.
- ⚠️ **IPI.** A resposta foi "uma só para tudo", mas:
  - a tabela PAM traz IPI por item: 3,25% (6.515 itens), 0% (532), 6,5% (130), 5,2% (67), 9,75% (4);
  - o rodapé da proposta já diz "Parafusos 6,5%".

  **Decisão:** padrão global **3,25%** (configurável); o item herda a alíquota da tabela do fornecedor quando existir; o vendedor pode trocar.
- ✅ **Sempre CONSUMO**: o campo sai fixo como "CONSUMO" e o sistema não pergunta.

## Marcas e custo
- ✅ Custo guardado **por produto + marca**.
- ✅ **PAM primeiro**: o orçamento sugere PAM. Outra marca só entra quando a PAM não tem o item (no catálogo ou em estoque).

## Estoque e pedido
- ✅ **Vendido (aprovado) reserva; Enviado dá baixa.**
- ✅ Qualquer pessoa de Vendas pode aprovar.
- ✅ **Responsáveis por etapa são configuráveis** (por equipe, não por pessoa fixa). Padrão inicial:

  | Etapa | Equipe |
  |---|---|
  | Vendido | Vendas |
  | Conferência e Confirmado | Estoque (Leandro) |
  | Pago | Financeiro (Marleia) |
  | Enviado, Rastreio e Entregue | Logística (Anthonyelle, Thayla) |

- ✅ Pagamento: **à vista** ou **entrada + 3 a 12 parcelas**. Não há integração bancária (fora de escopo).
- ✅ Unidades:
  - **tubos controlados em mm**: as tabelas vêm em R$/m e o sistema converte;
  - "PEÇ" da PAM vira **UN**.
- ✅ **Tubos fabricados**: só sob encomenda; o custo usa a tabela PAM. Fórmula da planilha atual: `(CUSTO_M/1000 × L(mm) + FLANGE × QTD_FLANGE + ADICIONAL) × 1,05`. Testada.

## Clientes, proposta, avisos
- ✅ IE: busca do CNPJ grátis + IE digitada + botão do Sintegra da UF.
- ✅ Validade padrão: **5 dias** (vem do AppSheet e da proposta real).
- ✅ Avisos: no app + e-mail + **notificação no celular** (push do PWA).
- ✅ WhatsApp: botão `wa.me` com o link da proposta.
- ✅ Trello: não; tudo fica no sistema.

## Pessoas e acesso
- ✅ Login com **e-mail + senha**, cadastro com celular. O Admin libera cada novo usuário.
- ✅ Papéis:

  | Papel | Quem | Pode |
  |---|---|---|
  | admin | Victor Monteiro | Tudo |
  | gerente | Victor Araújo (chefe/dono) | Tudo de Vendas + custo, margem e dashboard gerencial |
  | vendas | Marco e demais vendedores | Orçar, aprovar, ver custo e margem |
  | estoque | Leandro | Sem custo/margem |
  | financeiro | Marleia | Etapa "Pago" |
  | logistica | Anthonyelle, Thayla | Pedidos a partir de "Confirmado", sem custo |
  | leitura | — | Reservado para o futuro |

## Hospedagem
- ✅ Repositório novo; contas Vercel e Supabase em nome da empresa, **com o Victor como dono**; plano gratuito; domínio próprio só no final.

---

## O que os arquivos enviados mostraram

| Arquivo | Conteúdo útil |
|---|---|
| `Brasil_Infra_22.10.26.pdf` | Modelo real da proposta: A4 paisagem, logo, blocos Oferente/Cliente, 11 colunas, rodapé com 5 observações. Logo extraído em `assets/logo-horizontal.png` |
| `TP GOMES ARAÚJO … FOB-MT 001-001.xlsx` | Tabela PAM FOB de 01/09/2026: **7.248 itens**, cabeçalho na linha 30 (DESCRIÇÃO SAP, FIGURA, CÓD SAP, USINA, Aplicação, NCM, Unid, Peso, ICMS, IPI, R$ s/IPI, R$ c/IPI). Válida até 31/12/2026 |
| `PLANILHA_COMERCIAL_UNIFICADA….xlsx` | Catálogo de orçamento com **4.883 itens** (PAM 1.933, Angolini 1.359, Outras 1.359, Fanuel 169, anéis 54, parafusos 9), **840 sem custo**, **120 tubos fabricados** com regra de consumo (tubo base + flanges), **285 clientes** |
| `TUBOS_FABRICADOS_MT_COMPLETO.xlsx` | **348 tubos fabricados** (T001…), com custo/m, flange, qtd. de flanges e adicional |
| `VENDAS_MT_SANEAMENTO_APPSHEET.xlsx` | Configurações (1,6; IPI 3,25%; validade 5 dias), 8.693 preços PAM/Angolini com custo CIF e FOB **sem IPI**, 284 clientes |

**Consequência no modelo de dados:** existem dois universos.
- **Catálogo para orçar:** ~5 mil itens das tabelas dos fornecedores.
- **Itens com estoque:** ~535, da Google Sheet do AppSheet.

O produto ganha a marcação "controla estoque". Assim dá para orçar qualquer item da tabela sem poluir o estoque.

## ❓ Ainda falta
1. **Numeração:** a proposta da Brasil Infra é nº **2**, a do Marco está em **2.2xx**. A sequência é **única para a empresa** ou **uma por vendedor**?
2. **Fabricação:** fabricar um tubo deve **baixar do estoque** o tubo base (em mm) e os flanges, como na aba CONSUMO_FABRICACAO?
3. **"Pago":** a etapa conta como cumprida quando a **entrada** é recebida? As parcelas são só anotadas?
4. **REPOR:** é quando o saldo fica **abaixo** de 5 ou **igual ou abaixo** de 5?
5. **Tubos fabricados:** a planilha "COMPLETO" tem 348 e a unificada tem 120. Qual é a lista oficial?
6. **Arquivos que faltam:**
   - link da Google Sheet do estoque (os ~535 itens, saldos por marca e movimentações);
   - "ORÇAMENTOS - NOVO MODELO - MARCO - 2.xlsx";
   - tabela PAM **CIF**;
   - tabela **Angolini** atual. A planilha unificada usa uma "FOB 28.05.26"; o AppSheet diz "Março/2022".
