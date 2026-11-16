#!/usr/bin/env python3
"""Varre um texto atrás de sinais de escrita por IA (palavras e frases do catálogo em ../referencia.md).

Uso:  python3 detectar.py arquivo.txt      (ou "-" para ler da entrada padrão)

Só acha padrões de superfície. Estrutura (regra de três, importância inflada sem palavra-chave,
citações falsas) precisa de leitura. Nenhum achado isolado prova nada: olhe a densidade.
"""
import re
import sys
import unicodedata

# categoria -> lista de expressões regulares (inglês e português), sem diferenciar maiúsculas.
PADROES = {
    "Importância inflada / legado": [
        r"\b(stands|serves) as\b", r"\bis a (testament|reminder)\b", r"\btestament to\b",
        r"\b(crucial|pivotal|vital|significant|key) (role|moment)\b", r"\b(underscores|highlights) (its|the) (importance|significance)\b",
        r"\breflects? broader\b", r"\b(ongoing|enduring|lasting) (legacy|impact|influence)\b", r"\bsetting the stage for\b",
        r"\b(represents|marks) a (significant )?shift\b", r"\bkey turning point\b", r"\bevolving landscape\b", r"\bfocal point\b",
        r"\bindelible mark\b", r"\bdeeply rooted\b",
        r"\btestemunho (de|do|da)\b", r"\b(papel|momento) (crucial|fundamental|decisivo|vital|central)\b", r"\b(é|foi|representa) um marco\b",
        r"\blegado (duradouro|perene)\b", r"\breflete tend[eê]ncias\b", r"\bprofundamente enraizad[oa]\b", r"\bdeixou sua marca\b",
    ],
    "Moldou discussões": [r"\bha(s|ve) shaped (conversations|discussions|debates?)\b", r"\b(fomentou|suscitou|tem fomentado) (discuss|debate)"],
    "Notabilidade / mídia forçada": [
        r"\bindependent coverage\b", r"\b(local|regional|national) media outlets\b", r"\btrade publications\b",
        r"\b(cited|featured|profiled) in\b", r"\bdestaque em (diversos|v[áa]rios) ve[íi]culos\b",
    ],
    "Fontes 'identificam' o assunto": [r"\b(databases|records|listings|filings) (identify|list|describe)\b", r"\bprofessional profile lists\b"],
    "Presença online": [r"\bactive social media presence\b", r"\bpresen[çc]a ativa nas redes\b"],
    "Análise rasa com gerúndio": [
        r",\s+(highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|contributing to|cultivating|fostering|encompassing|enhancing|showcasing)\b",
        r"\bvaluable insights\b", r"\b(aligns?|resonates?) with\b",
        r",\s+(destacando|refor[çc]ando|enfatizando|garantindo|refletindo|simbolizando|contribuindo para|fomentando|potencializando|evidenciando)\b",
        r"\binsights valiosos\b",
    ],
    "Ligação vaga": [r"\b(in )?(connection|association) with\b", r"\bconnected (with|to)\b", r"\bassociated with\b"],
    "Atribuição vaga": [
        r"\bindustry reports\b", r"\bobservers have (cited|noted)\b", r"\bexperts (argue|say|note)\b", r"\bsome critics argue\b",
        r"\bseveral (sources|publications)\b", r"\bespecialistas (apontam|afirmam|destacam)\b", r"\bcr[íi]ticos (apontam|afirmam)\b",
        r"\bdiversos (estudos|especialistas|ve[íi]culos)\b",
    ],
    "Fórmula de desafios / futuro": [
        r"\bdespite (its|these|the)\b.{0,80}\bchallenges\b", r"\bfuture (outlook|prospects)\b", r"\bchallenges and legacy\b",
        r"\bapesar (de|dos?|das?)\b.{0,80}\bdesafios\b", r"\bperspectivas futuras\b",
    ],
    "Seção Awards and recognition": [r"^\W*(awards and recognition|recognition)\W*$", r"^\W*(pr[êe]mios e reconhecimento)\W*$"],
    "Vocabulário de IA": [
        r"^\s*additionally\b", r"\badditionally,", r"\bboasts?\b", r"\bbolstered\b", r"\bcrucial\b", r"\bdeep dive\b", r"\bdelv(e|es|ing)\b",
        r"\bemphasizing\b", r"\benduring\b", r"\benhanc(e|es|ing)\b", r"\bfoster(s|ing)?\b", r"\bgarner(s|ed)?\b", r"\bhighlight(s|ing)?\b",
        r"\binterplay\b", r"\bintricate|intricacies\b", r"\blandscape\b", r"\bmeticulous(ly)?\b", r"\bpivotal\b", r"\brobust\b",
        r"\bshowcas(e|es|ing)\b", r"\btapestry\b", r"\btestament\b", r"\bunderscor(e|es|ing)\b", r"\bvaluable\b", r"\bvibrant\b",
        r"\bleverag(e|es|ing)\b", r"\bmultifaceted\b", r"\bprioritiz(e|es|ing)\b", r"\bquietly\b", r"\buniversally\b", r"\bechoed\b",
        r"\bademais\b", r"^\s*al[ée]m disso,", r"\bcruciais\b", r"\brobust[oa]s?\b", r"\bvibrantes?\b", r"\bmergulh(ar|o) fundo\b",
        r"\bmeticulosamente\b", r"\bintrincad[oa]s?\b", r"\btape[çc]aria\b", r"\bmultifacetad[oa]s?\b", r"\balavanc(ar|a)\b", r"\bpotencializ(ar|a)\b",
    ],
    "Foge do 'é/tem'": [
        r"\b(serves|stands|functions|operates) as an?\b", r"\b(features|offers|maintains) an?\b",
        r"\bserve como\b", r"\bse configura como\b", r"\bse destaca como\b", r"\bconta com (um|uma)\b",
    ],
    "Paralelismo negativo": [
        r"\bnot only\b.{0,120}\bbut\b", r"\bit'?s not (just )?[^.]{1,60}, it'?s\b", r"\bis not (just|merely) [^.]{1,60}, (it|but)\b",
        r"\brather than\b", r"\bn[ãa]o ([ée] )?(apenas|s[óo]|somente)\b.{0,120}\bmas\b", r"\bn[ãa]o [ée] [^.]{1,60}, [ée]\b", r"\bem vez de\b",
    ],
    "Fala com o usuário": [
        r"\bi hope this helps\b", r"\bcertainly!", r"\bof course!", r"\byou'?re absolutely right\b", r"\bwould you like\b",
        r"\bis there anything else\b", r"\blet me know\b", r"\bhere is an?\b", r"\ba wikipedia-style article\b",
        r"\bespero (ter ajudado|que (isso )?ajude)\b", r"\bclaro!", r"\bcom certeza!", r"\bvoc[êe] tem (toda|toda a) raz[ãa]o\b",
        r"\bquer que eu\b", r"\bposso ajudar em algo mais\b", r"\bsegue (abaixo|a seguir)\b",
    ],
    "Ressalva sobre fontes": [
        r"\bit is important to note\b", r"\bspecific details are (limited|scarce)\b", r"\bnot widely (available|documented|disclosed)\b",
        r"\b(in|based on) (the )?(provided|available) (sources|information|search results)\b", r"\bmaintains a low profile\b",
        r"\bshould be (treated|presented) as\b", r"\bdoes not by itself establish\b", r"\bshould not be confused with\b",
        r"\b[ée] importante (notar|ressaltar|destacar)\b", r"\bcom base nas informa[çc][õo]es dispon[íi]veis\b",
        r"\bn[ãa]o h[áa] (dados|informa[çc][õo]es) p[úu]blic", r"\bn[ãa]o deve ser confundid[oa]\b",
    ],
    "Lacunas não preenchidas": [
        r"\[(name|your [a-z ]+|nome|sua [a-z ]+|seu [a-z ]+|inserir [^\]]+|insert [^\]]+)\]", r"\b20\d\d-xx-xx\b",
        r"\binsert_[a-z_]+(url|here)", r"example\.com/\S+",
    ],
    "Marcação / markdown fora do lugar": [r"\*\*[^*]+\*\*", r"^#{1,6} ", r"^-{3,}\s*$", r"```", r"\[[^\]]+\]\(https?://", r"contentReference\[oaicite", r"oaicite"],
    "Rastreio de chatbot em links": [r"utm_source=(chatgpt\.com|openai|copilot\.com)", r"referrer=grok\.com"],
    "Conclusão-resumo": [r"^\s*(in summary|in conclusion|overall)\b", r"^\s*(em resumo|em suma|em conclus[ãa]o|de modo geral)\b"],
    "Propaganda (histórico)": [
        r"\bnestled\b", r"\bin the heart of\b", r"\bgroundbreaking\b", r"\brenowned\b", r"\bdiverse array\b", r"\bcommitment to\b",
        r"\bnatural beauty\b", r"\bexemplifies\b", r"\bno cora[çc][ãa]o d[aeo]\b", r"\brenomad[oa]\b", r"\binovador[a]?\b",
        r"\bcompromisso com\b", r"\brica diversidade\b",
    ],
    "Corte de conhecimento / recusa (histórico)": [
        r"\bas of my last (knowledge|training) update\b", r"\bup to my last training update\b", r"\bas an ai language model\b",
        r"\bas a large language model\b", r"\bcomo (um )?modelo de linguagem\b",
    ],
}


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    texto = sys.stdin.read() if sys.argv[1] == "-" else open(sys.argv[1], encoding="utf-8").read()
    texto = unicodedata.normalize("NFC", texto)
    linhas = texto.splitlines()
    palavras = max(1, len(re.findall(r"\w+", texto)))

    total = 0
    for cat, regs in PADROES.items():
        achados = []
        for n, linha in enumerate(linhas, 1):
            for r in regs:
                for m in re.finditer(r, linha, flags=re.IGNORECASE):
                    achados.append((n, m.group(0).strip()))
        if achados:
            total += len(achados)
            print(f"\n## {cat} ({len(achados)})")
            for n, t in achados[:15]:
                print(f"  linha {n}: {t}")
            if len(achados) > 15:
                print(f"  … e mais {len(achados) - 15}")

    travessoes = texto.count("—")
    curvas = len(re.findall(r"[“”’]", texto))
    trios = len(re.findall(r"\b\w+, \w+,? (and|e) \w+\b", texto))
    print("\n## Contagens")
    print(f"  travessões (—): {travessoes} ({travessoes * 1000 / palavras:.1f} por mil palavras)")
    print(f"  aspas/apóstrofos curvos: {curvas}")
    print(f"  possíveis trios 'a, b e c': {trios}")
    dens = total * 1000 / palavras
    print(f"\nTotal: {total} achados em {palavras} palavras ({dens:.1f} por mil palavras).")
    print("Leia cada achado no contexto: uma palavra isolada não prova nada; vários padrões juntos pesam.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
