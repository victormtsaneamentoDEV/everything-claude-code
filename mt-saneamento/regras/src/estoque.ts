/**
 * Estoque como razão (ledger): o saldo nunca é digitado, é a soma das movimentações.
 */
export type TipoMovimento =
  | "INICIAL"
  | "ENTRADA"
  | "SAIDA"
  | "AJUSTE_ENTRADA"
  | "AJUSTE_SAIDA"
  | "TRANSF_ENTRADA"
  | "TRANSF_SAIDA";

export interface Movimento {
  marca: string;
  tipo: TipoMovimento;
  /** Sempre positiva; o sinal vem do tipo. */
  quantidade: number;
}

const SINAL: Record<TipoMovimento, 1 | -1> = {
  INICIAL: 1,
  ENTRADA: 1,
  AJUSTE_ENTRADA: 1,
  TRANSF_ENTRADA: 1,
  SAIDA: -1,
  AJUSTE_SAIDA: -1,
  TRANSF_SAIDA: -1,
};

/** Soma com 3 casas (M/MM podem ser fracionados) sem acumular erro de float. */
const MIL = 1000;

/** Saldo por marca = inicial + entradas − saídas (± ajustes e transferências). */
export function saldoPorMarca(movimentos: Iterable<Movimento>): Map<string, number> {
  const milesimos = new Map<string, number>();
  for (const m of movimentos) {
    if (!(m.quantidade > 0)) throw new Error("Quantidade de movimento precisa ser maior que zero.");
    const atual = milesimos.get(m.marca) ?? 0;
    milesimos.set(m.marca, atual + SINAL[m.tipo] * Math.round(m.quantidade * MIL));
  }
  return new Map([...milesimos].map(([marca, q]) => [marca, q / MIL]));
}

/** Total do produto = soma das marcas. */
export function saldoTotal(porMarca: Map<string, number>): number {
  let t = 0;
  for (const q of porMarca.values()) t += Math.round(q * MIL);
  return t / MIL;
}

/** Disponível para venda = saldo − reservado (orçamentos aprovados ainda não enviados). */
export function disponivel(saldo: number, reservado: number): number {
  return (Math.round(saldo * MIL) - Math.round(reservado * MIL)) / MIL;
}

export type StatusEstoque = "NEGATIVO" | "ZERADO" | "REPOR" | "OK";

export const ESTOQUE_MINIMO_PADRAO = 5;

/**
 * Status do produto. NEGATIVO nunca é silencioso: aparece como alerta.
 * REPOR quando o saldo está ABAIXO do mínimo (saldo < mínimo) — a confirmar com o Victor.
 */
export function statusEstoque(saldo: number, minimo = ESTOQUE_MINIMO_PADRAO): StatusEstoque {
  if (saldo < 0) return "NEGATIVO";
  if (saldo === 0) return "ZERADO";
  if (saldo < minimo) return "REPOR";
  return "OK";
}
