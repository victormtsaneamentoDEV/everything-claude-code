/**
 * Regra especial: tubo ponta-bolsa DN100 pedido como K7 é cotado como K9
 * (descrição e custo do K9). Ex.: "TUBO TK7JGS 100 6000" → "TUBO TK9JGS 100 6000".
 */
const PADRAO = /^(\s*TUBO\s+T?)K7(\S*\s+100)(?!\d)/i;

export function aplicarRegraK7paraK9(descricao: string): { descricao: string; alterado: boolean } {
  if (!PADRAO.test(descricao)) return { descricao, alterado: false };
  return { descricao: descricao.replace(PADRAO, "$1K9$2"), alterado: true };
}
