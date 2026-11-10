import { describe, expect, it } from "vitest";
import {
  arredondarParaCimaReais,
  calcularPrecoItem,
  custoComIpi,
  formatarDecimal,
  formatarMoeda,
  resolverMultiplicador,
} from "../src";

describe("arredondamento para cima em reais inteiros", () => {
  it("sobe qualquer centavo", () => {
    expect(arredondarParaCimaReais(160.01)).toBe(161);
    expect(arredondarParaCimaReais(160.0001)).toBe(161);
  });
  it("não sobe valor já inteiro, mesmo com ruído de float", () => {
    expect(100 * 1.1).not.toBe(110); // ruído do JavaScript: 110,00000000000001
    expect(Math.ceil(100 * 1.1)).toBe(111); // o jeito ingênuo erraria
    expect(arredondarParaCimaReais(100 * 1.1)).toBe(110);
    expect(arredondarParaCimaReais(160)).toBe(160);
  });
});

describe("calcularPrecoItem — regra (a): custo COM IPI × multiplicador, para cima", () => {
  it("custo 100,00 × 1,6 = 160 com IPI; sem IPI = 160 / 1,0325", () => {
    const p = calcularPrecoItem({ custoComIpi: 100, multiplicador: 1.6, aliquotaIpi: 0.0325 });
    expect(p.precoComIpi).toBe(160);
    expect(p.precoSemIpi).toBe(154.96);
    expect(p.ipiUnitario).toBe(5.04);
    expect(p.margemUnitaria).toBe(60);
    expect(p.margemPercentual).toBeCloseTo(0.6);
    expect(p.abaixoDoCusto).toBe(false);
  });

  it("tubo PAM TK10JGSAZ 80 (FOB set/26: 269,33 sem IPI) → custo com IPI 278,0832", () => {
    const custo = custoComIpi(269.33, 0.0325);
    expect(custo).toBe(278.0832);
    const p = calcularPrecoItem({ custoComIpi: custo, multiplicador: 1.6, aliquotaIpi: 0.0325 });
    expect(p.precoComIpi).toBe(445); // 444,93 → 445
    expect(p.precoSemIpi + p.ipiUnitario).toBeCloseTo(445, 10);
  });

  it("parafusos usam IPI de 6,5%", () => {
    const p = calcularPrecoItem({ custoComIpi: 10, multiplicador: 1.6, aliquotaIpi: 0.065 });
    expect(p.precoComIpi).toBe(16);
    expect(p.precoSemIpi).toBe(15.02);
    expect(p.ipiUnitario).toBe(0.98);
  });

  it("multiplicador reduzido (desconto) é permitido", () => {
    expect(calcularPrecoItem({ custoComIpi: 100, multiplicador: 1.45, aliquotaIpi: 0.0325 }).precoComIpi).toBe(145);
  });

  it("avisa quando o desconto deixa abaixo do custo", () => {
    expect(calcularPrecoItem({ custoComIpi: 100, multiplicador: 0.9, aliquotaIpi: 0.0325 }).abaixoDoCusto).toBe(true);
  });

  it("rejeita multiplicador zero/negativo e custo inválido", () => {
    expect(() => calcularPrecoItem({ custoComIpi: 100, multiplicador: 0, aliquotaIpi: 0 })).toThrow();
    expect(() => calcularPrecoItem({ custoComIpi: Number.NaN, multiplicador: 1.6, aliquotaIpi: 0 })).toThrow();
  });
});

describe("resolverMultiplicador: manual > produto > marca > global", () => {
  it("usa o global quando não há exceção", () => {
    expect(resolverMultiplicador({ global: 1.6 })).toBe(1.6);
  });
  it("marca sobrepõe global", () => {
    expect(resolverMultiplicador({ global: 1.6, porMarca: 1.5 })).toBe(1.5);
  });
  it("produto sobrepõe marca", () => {
    expect(resolverMultiplicador({ global: 1.6, porMarca: 1.5, porProduto: 1.8 })).toBe(1.8);
  });
  it("manual (desconto no item) sobrepõe tudo", () => {
    expect(resolverMultiplicador({ global: 1.6, porMarca: 1.5, porProduto: 1.8, manual: 1.4 })).toBe(1.4);
  });
  it("ignora nulos", () => {
    expect(resolverMultiplicador({ global: 1.6, porMarca: null, porProduto: null, manual: null })).toBe(1.6);
  });
});

describe("formatação pt-BR", () => {
  it("moeda", () => {
    expect(formatarMoeda(61040)).toBe("R$ 61.040,00");
    expect(formatarMoeda(1234.56)).toBe("R$ 1.234,56");
  });
  it("decimal das colunas", () => {
    expect(formatarDecimal(1450.85)).toBe("1.450,85");
  });
});
