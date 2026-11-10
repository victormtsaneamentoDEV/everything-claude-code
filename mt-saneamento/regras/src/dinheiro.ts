/**
 * Utilidades de dinheiro. Todos os cálculos internos são feitos em CENTAVOS
 * inteiros para evitar erros de ponto flutuante (ex.: 0,1 + 0,2).
 */

/** Converte reais (número) para centavos inteiros. */
export function paraCentavos(reais: number): number {
  return Math.round(reais * 100);
}

/** Converte centavos inteiros para reais. */
export function paraReais(centavos: number): number {
  return centavos / 100;
}

/** Arredonda para 2 casas (meio para cima), sem ruído de ponto flutuante. */
export function arredondar2(valor: number): number {
  return paraReais(Math.round(Number((valor * 100).toFixed(6))));
}

/**
 * Arredonda PARA CIMA em reais inteiros (regra da MT: preço nunca quebrado).
 * Limpa o ruído de float antes (ex.: 100 × 1,1 = 110,00000000000001 → 110, não 111).
 */
export function arredondarParaCimaReais(valor: number): number {
  const limpo = Math.round(valor * 1e6) / 1e6;
  return Math.ceil(limpo);
}

const FORMATO_MOEDA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formata no padrão "R$ 1.234,56" (espaço comum, não o espaço inseparável do Intl). */
export function formatarMoeda(valor: number): string {
  return FORMATO_MOEDA.format(valor).replace(/ /g, " ");
}

const FORMATO_DECIMAL = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formata "1.234,56" (sem R$), como nas colunas da proposta. */
export function formatarDecimal(valor: number): string {
  return FORMATO_DECIMAL.format(valor);
}
