import { arredondar2, arredondarParaCimaReais, paraCentavos, paraReais } from "./dinheiro";

/** Multiplicador padrão (configurável em Configurações). */
export const MULTIPLICADOR_PADRAO = 1.6;

/** IPI padrão de tubos e conexões quando o item não traz alíquota própria. */
export const IPI_PADRAO = 0.0325;

export interface FontesMultiplicador {
  /** Multiplicador global (Configurações). */
  global: number;
  /** Exceção por marca, se houver. */
  porMarca?: number | null;
  /** Exceção por produto, se houver. */
  porProduto?: number | null;
  /** Valor digitado pelo vendedor no item (ex.: desconto para fechar negócio). */
  manual?: number | null;
}

/**
 * Escolhe o multiplicador do item.
 * Prioridade: manual (item) > produto > marca > global.
 */
export function resolverMultiplicador(f: FontesMultiplicador): number {
  const escolhido = [f.manual, f.porProduto, f.porMarca, f.global].find(
    (m): m is number => typeof m === "number" && Number.isFinite(m),
  );
  if (escolhido === undefined || escolhido <= 0) {
    throw new Error("Multiplicador inválido: precisa ser um número maior que zero.");
  }
  return escolhido;
}

export interface EntradaPreco {
  /** Custo unitário de compra COM IPI (valor de estoque). */
  custoComIpi: number;
  multiplicador: number;
  /** Alíquota de IPI em fração (0,0325 = 3,25%). */
  aliquotaIpi: number;
}

export interface PrecoItem {
  /** Preço unitário de venda COM IPI — sempre reais inteiros. */
  precoComIpi: number;
  /** Preço unitário SEM IPI (coluna "VALOR UNIT. SEM IPI" da proposta). */
  precoSemIpi: number;
  /** IPI unitário em R$ (coluna "IPI UNIT."). */
  ipiUnitario: number;
  /** Margem bruta unitária em R$ (preço com IPI − custo com IPI). Uso interno. */
  margemUnitaria: number;
  /** Margem sobre o custo em fração (0,6 = 60%). Uso interno. */
  margemPercentual: number;
  /** true se o multiplicador deixou o preço abaixo do custo. */
  abaixoDoCusto: boolean;
}

/**
 * Separa o IPI de um preço que já o inclui, como na proposta:
 * sem IPI = preço ÷ (1 + alíquota), arredondado em centavos; IPI = diferença.
 * Assim "sem IPI + IPI" sempre fecha exatamente no preço com IPI.
 */
export function desmembrarIpi(precoComIpi: number, aliquotaIpi: number) {
  if (aliquotaIpi < 0) throw new Error("Alíquota de IPI não pode ser negativa.");
  const comCent = paraCentavos(precoComIpi);
  const semCent = paraCentavos(arredondar2(precoComIpi / (1 + aliquotaIpi)));
  return { precoSemIpi: paraReais(semCent), ipiUnitario: paraReais(comCent - semCent) };
}

/**
 * Regra de preço da MT Saneamento (confirmada pelo Victor em 10/11/2026):
 *   preço com IPI = ARRED.PARA.CIMA(custo com IPI × multiplicador) em reais inteiros
 *   preço sem IPI = preço com IPI ÷ (1 + alíquota de IPI)
 */
export function calcularPrecoItem({ custoComIpi, multiplicador, aliquotaIpi }: EntradaPreco): PrecoItem {
  if (!(custoComIpi >= 0)) throw new Error("Custo inválido.");
  if (!(multiplicador > 0)) throw new Error("Multiplicador inválido: precisa ser maior que zero.");
  const precoComIpi = arredondarParaCimaReais(custoComIpi * multiplicador);
  const { precoSemIpi, ipiUnitario } = desmembrarIpi(precoComIpi, aliquotaIpi);
  const margemUnitaria = arredondar2(precoComIpi - custoComIpi);
  return {
    precoComIpi,
    precoSemIpi,
    ipiUnitario,
    margemUnitaria,
    margemPercentual: custoComIpi > 0 ? margemUnitaria / custoComIpi : 0,
    abaixoDoCusto: precoComIpi < custoComIpi,
  };
}

/** Total do item = preço unitário com IPI × quantidade (arredondado em centavos). */
export function totalItem(precoComIpi: number, quantidade: number): number {
  return arredondar2(precoComIpi * quantidade);
}

/** Soma totais em centavos para não acumular erro. */
export function somarTotais(totais: number[]): number {
  return paraReais(totais.reduce((s, t) => s + paraCentavos(t), 0));
}

/** Custo sem IPI → custo com IPI (quando a tabela do fornecedor só traz o "sem IPI"). */
export function custoComIpi(custoSemIpi: number, aliquotaIpi: number): number {
  return Math.round(custoSemIpi * (1 + aliquotaIpi) * 1e4) / 1e4;
}
