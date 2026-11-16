---
name: sinais-de-escrita-ia
description: Use when reviewing, editing or writing text (articles, proposals, e-mails, docs, PR descriptions, posts) that may sound AI-generated or "robotic", when asked whether a text was written by AI, or when asked to make text sound more human. Covers the Wikipedia "Signs of AI writing" catalogue (AI vocabulary like delve/pivotal/testament, negative parallelisms, rule of three, puffery, vague attributions, markdown leftovers, chatbot phrases, fake citations, utm_source=chatgpt.com) plus Portuguese equivalents.
---

# Sinais de escrita por IA

Baseado na página da Wikipédia **"Wikipedia:Signs of AI writing"** (lida em 16/11/2026). O catálogo completo, com as palavras de cada padrão, está em `referencia.md`. Este arquivo diz como usar.

## Princípio

Texto de IA tende à média: soa genérico, inflado e "certinho", e repete fórmulas. **Nenhum sinal isolado prova nada.** O que pesa é a **densidade**: vários padrões juntos, repetidos, em texto escrito depois de nov/2022.

## Dois modos

### 1. Revisar ou detectar ("isso foi escrito por IA?", "revise este texto")

1. Rode o script para uma primeira varredura (ele acha palavras e frases, não julga):
   `python3 scripts/detectar.py arquivo.txt` (ou `-` para ler da entrada padrão).
2. Leia o texto procurando os padrões de **estrutura** que o script não pega (tabela abaixo).
3. Responda com o **formato de laudo**:
   - **Veredito:** provável IA / incerto / provável humano, e o grau de confiança.
   - **Evidências:** cada padrão encontrado, com o trecho citado e a categoria.
   - **Sinais humanos** encontrados (contam a favor).
   - **Limites:** lembre que detectores e pessoas erram muito; não acuse com base em estilo apenas.
4. Se pedirem para corrigir, reescreva aplicando o modo 2 e mostre o antes e depois dos trechos alterados.

### 2. Escrever ou reescrever (texto que deve soar humano)

Escreva assim:
- **Fato direto, com "é" e "tem".** "A empresa tem 40 funcionários", não "boasts a team of 40" / "conta com uma robusta equipe".
- **Afirme o que a fonte diz, com a fonte nomeada.** Nada de "especialistas apontam", "diversos veículos destacam".
- **Importância só se a fonte disser.** Corte "marco fundamental", "legado duradouro", "papel crucial", "reflete tendências mais amplas".
- **Frase termina no fato.** Corte o rabo em gerúndio que comenta o fato ("…, destacando sua importância", "…, contribuindo para…").
- **Listas com o número de itens que o conteúdo tem**, não sempre três.
- **Afirmações positivas diretas**, sem "não apenas X, mas também Y", "não é X, é Y", "Y em vez de X".
- **Palavras comuns:** "usou", "escreveu", "morreu", não "utilizou", "autorou", "faleceu".
- **Formatação do meio de destino:** sem markdown onde não há markdown, sem negrito espalhado, sem emoji em título, títulos com só a primeira letra maiúscula.
- **Sem conversa com o leitor no texto final:** nada de "Espero que ajude", "Claro!", "Quer que eu…", "verifique antes de publicar".
- **Sem lacunas:** nenhum [Nome], "2025-xx-xx", "INSERIR_URL", example.com.
- **Citações reais:** só links que você abriu, DOI/ISBN conferidos, página do livro quando houver; nunca `utm_source=chatgpt.com`.
- **Sem conclusão-resumo** ("Em resumo", "Em suma") e sem seção-fórmula "Desafios e perspectivas".
- **Travessão com moderação:** prefira vírgula, dois-pontos ou parênteses.

## Referência rápida

| Categoria | Sinal típico (EN) | Equivalente PT (adaptação) |
|---|---|---|
| Importância inflada | stands as, testament, pivotal moment, enduring legacy, evolving landscape | é um marco, testemunho, momento crucial, legado duradouro |
| Moldou debates | has shaped discussions about | tem fomentado discussões sobre |
| Notabilidade forçada | independent coverage, featured in, trade publications | foi destaque em diversos veículos |
| Presença online | maintains an active social media presence | mantém presença ativa nas redes |
| Análise rasa em "-ing" | highlighting, underscoring, ensuring, fostering | destacando, reforçando, garantindo, fomentando |
| Ligação vaga | associated with, connected to | associado a, ligado a |
| Atribuição vaga | experts argue, observers note, several sources | especialistas apontam, diversos estudos |
| Fórmula de desafios | Despite its…, faces challenges; Future Outlook | Apesar de…, enfrenta desafios; Perspectivas futuras |
| Vocabulário de IA | delve, tapestry, robust, crucial, vibrant, showcase, Additionally | robusto, crucial, vibrante, ademais, mergulhar fundo |
| Foge do "é/tem" | serves as, boasts, features, offers | serve como, conta com, se destaca como |
| Paralelismo negativo | not only… but; it's not X, it's Y; Y rather than X | não apenas… mas; não é X, é Y |
| Regra de três | trios de adjetivos/frases | idem |
| Estilo | Title Case, negrito demais, emoji, aspas curvas | idem |
| Fala ao usuário | I hope this helps, Certainly!, Would you like… | Espero ter ajudado, Claro!, Quer que eu… |
| Ressalva de fonte | not widely documented, based on available information | não há informações públicas, com base nas informações disponíveis |
| Lacunas | [Name], 2025-xx-xx, INSERT_URL | [Nome], INSERIR_LINK |
| Marcação | **, ##, ---, ```wikitext, oaicite | idem |
| Citação | link morto, DOI errado, livro sem página, utm_source=chatgpt.com | idem |
| Conclusão | In summary, In conclusion, Overall | Em resumo, Em suma, Em conclusão |

## O que NÃO é sinal (não use como prova)

Gramática perfeita · mistura de tom formal e informal · texto "sem graça" · texto rebuscado em geral · palavras de transição isoladas · falta de fontes · marcação estranha aleatória · marcação correta.

## Sinais de escrita humana

Texto anterior a 30/11/2022 · autor explica as próprias escolhas · "há um", "tem um" · palavras simples · superlativos concretos ("foi o primeiro") · ressalvas e intensificadores ("muito", "talvez") · construções prolixas ("a fim de", "o fato de que").

## Erros comuns ao usar esta skill

- **Acusar com base em uma palavra.** "Crucial" sozinho não diz nada; conte a densidade.
- **Esquecer a data.** A lista de palavras muda com o tempo (ver `referencia.md`, item 11). Travessão era sinal forte até 2026 e perdeu força.
- **Reescrever trocando sinônimos.** Trocar "crucial" por "essencial" mantém o padrão; o certo é cortar a frase de importância ou pôr o fato no lugar.
- **Criar novos padrões ao corrigir**, por exemplo trocando todo trio por duplas ou tirando todo travessão de forma mecânica.
