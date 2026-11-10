import { arredondar2 } from "./dinheiro";

/** Acréscimo de fabricação usado na planilha atual: (…) × 1,05. */
export const FATOR_FABRICACAO_PADRAO = 1.05;

export interface EntradaTuboFabricado {
  /** Custo do tubo base por METRO, com IPI (tabela PAM). */
  custoMetro: number;
  /** Comprimento do tubo fabricado em MILÍMETROS. */
  comprimentoMm: number;
  /** Custo unitário do flange, com IPI. */
  custoFlange: number;
  /** Quantidade de flanges do tipo (TFL = 2, TFP = 1, TK9JGS = 0 …). */
  qtdFlange: number;
  /** Adicional fixo em R$ (ex.: TFP = 50, TFJGS = 100). */
  adicional: number;
  fatorFabricacao?: number;
}

/**
 * Custo de um tubo fabricado sob medida (fórmula da aba CAD_TUBOS_FAB):
 *   (CUSTO_M / 1000 × L(mm) + FLANGE × QTD_FLANGE + ADICIONAL) × 1,05
 */
export function custoTuboFabricado(e: EntradaTuboFabricado): number {
  if (!(e.comprimentoMm > 0)) throw new Error("Comprimento do tubo precisa ser maior que zero (em mm).");
  if (e.custoMetro < 0 || e.custoFlange < 0 || e.qtdFlange < 0 || e.adicional < 0) {
    throw new Error("Valores do tubo fabricado não podem ser negativos.");
  }
  const fator = e.fatorFabricacao ?? FATOR_FABRICACAO_PADRAO;
  const bruto = (e.custoMetro / 1000) * e.comprimentoMm + e.custoFlange * e.qtdFlange + e.adicional;
  return arredondar2(bruto * fator);
}

/** As tabelas vêm em R$/m; o controle é em mm. */
export function precoPorMetroParaMm(precoPorMetro: number): number {
  return precoPorMetro / 1000;
}

/** Converte metros para milímetros (sem erro de float para até 3 casas). */
export function metrosParaMm(metros: number): number {
  return Math.round(metros * 1000);
}
