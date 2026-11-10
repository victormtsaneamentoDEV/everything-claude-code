import { describe, expect, it } from "vitest";
import { desmembrarIpi, somarTotais, totalItem, IPI_PADRAO } from "../src";

/**
 * Proposta real nº 2 — Construtora Brasil Infraestrutura LTDA — 22/10/26.
 * Colunas: qtd, VALOR UNIT. COM IPI, VALOR UNIT. SEM IPI, IPI UNIT., TOTAL ITEM.
 * Confere que a regra do sistema reproduz o PDF centavo por centavo.
 */
const ITENS: Array<[string, number, number, number, number, number]> = [
  ["Joelho 45 graus ø 50 mm", 9, 61, 59.08, 1.92, 549],
  ["Joelho 45 graus ø 75 mm", 2, 112, 108.47, 3.53, 224],
  ["Joelho 45 graus ø 100 mm", 5, 125, 121.07, 3.93, 625],
  ["Luva bolsa e bolsa ø 50 mm", 2, 63, 61.02, 1.98, 126],
  ["Luva bolsa e bolsa ø 75 mm", 2, 71, 68.77, 2.23, 142],
  ["Luva bolsa e bolsa ø 100 mm", 11, 105, 101.69, 3.31, 1155],
  ["Joelho 87°30' ø 50 mm", 7, 79, 76.51, 2.49, 553],
  ["Joelho 87°30' ø 100 mm", 3, 172, 166.59, 5.41, 516],
  ["Junção 45º Ø 50 x 50mm", 2, 163, 157.87, 5.13, 326],
  ["Junção 45º Ø 75 x 50mm", 2, 184, 178.21, 5.79, 368],
  ["Junção 45º Ø 100 x 50mm", 8, 255, 246.97, 8.03, 2040],
  ["Junção 45º Ø 100 x 75mm", 5, 334, 323.49, 10.51, 1670],
  ["Junção 45º Ø 100 x 100mm", 3, 278, 269.25, 8.75, 834],
  ["Bucha de redução Ø 75 x 50mm", 1, 73, 70.7, 2.3, 73],
  ["Ralo sifonado Ø 150mm x saída 75mm", 6, 519, 502.66, 16.34, 3114],
  ["Plug PRSISBB HL 50MM", 17, 18, 17.43, 0.57, 306],
  ["Placa cega PCSBB Ø 100mm", 3, 132, 127.85, 4.15, 396],
  ["Anel Linha tradicional HL 50MM", 29, 7, 6.78, 0.22, 203],
  ["Anel Linha tradicional HL 100MM", 2, 10, 9.69, 0.31, 20],
  ["Anel Linha flex 50MM", 46, 7, 6.78, 0.22, 322],
  ["Anel Linha flex 75MM", 23, 9, 8.72, 0.28, 207],
  ["Anel Linha flex 100MM", 76, 9, 8.72, 0.28, 684],
  ["Tubo de ferro fundido 50MM", 8, 983, 952.06, 30.94, 7864],
  ["Tubo de ferro fundido 75MM", 3, 1351, 1308.47, 42.53, 4053],
  ["Tubo de ferro fundido 100MM", 23, 1498, 1450.85, 47.15, 34454],
  ["Pasta Lubrificante Atóxica", 4, 54, 52.3, 1.7, 216],
];

describe("Proposta real Brasil Infra (22/10/26)", () => {
  it.each(ITENS)("%s", (_desc, qtd, comIpi, semIpi, ipi, total) => {
    expect(desmembrarIpi(comIpi, IPI_PADRAO)).toEqual({ precoSemIpi: semIpi, ipiUnitario: ipi });
    expect(totalItem(comIpi, qtd)).toBe(total);
  });

  it("VALOR TOTAL = R$ 61.040,00", () => {
    expect(somarTotais(ITENS.map(([, qtd, com]) => totalItem(com, qtd)))).toBe(61040);
  });
});
