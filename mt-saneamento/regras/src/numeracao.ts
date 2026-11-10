/**
 * Número da proposta: é um inteiro exibido com ponto de milhar (2206 → "2.206").
 */
const FORMATO = new Intl.NumberFormat("pt-BR", { useGrouping: true, maximumFractionDigits: 0 });

export function formatarNumeroProposta(numero: number): string {
  if (!Number.isInteger(numero) || numero <= 0) throw new Error("Número de proposta inválido.");
  return FORMATO.format(numero);
}

/** Aceita "2.206", "2206" ou " 2.206 " e devolve 2206. */
export function lerNumeroProposta(texto: string | number): number {
  const s = String(texto).trim().replace(/\./g, "");
  if (!/^\d+$/.test(s)) throw new Error(`Número de proposta inválido: "${texto}"`);
  const n = Number(s);
  if (n <= 0) throw new Error(`Número de proposta inválido: "${texto}"`);
  return n;
}

/** Próximo número = maior existente + 1 (ou 1 se não houver nenhum). */
export function proximoNumeroProposta(existentes: Iterable<number>): number {
  let maior = 0;
  for (const n of existentes) if (n > maior) maior = n;
  return maior + 1;
}
