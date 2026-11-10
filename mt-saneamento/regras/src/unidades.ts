export const UNIDADES = ["UN", "M", "MM"] as const;
export type Unidade = (typeof UNIDADES)[number];

export function ehUnidade(u: string): u is Unidade {
  return (UNIDADES as readonly string[]).includes(u);
}

/** Só M e MM aceitam quantidade fracionada; UN precisa ser inteira. */
export function validarQuantidade(quantidade: number, unidade: Unidade): string | null {
  if (!Number.isFinite(quantidade) || quantidade <= 0) return "Quantidade precisa ser maior que zero.";
  if (unidade === "UN" && !Number.isInteger(quantidade)) return "Itens em UN não aceitam quantidade fracionada.";
  return null;
}
