import { describe, expect, it } from "vitest";
import {
  aplicarRegraK7paraK9,
  custoTuboFabricado,
  formatarCnpj,
  formatarData,
  formatarNumeroProposta,
  lerNumeroProposta,
  metrosParaMm,
  nomeArquivoProposta,
  nomeRegistroOrcamento,
  precoPorMetroParaMm,
  proximoNumeroProposta,
  validarCnpj,
  validarQuantidade,
} from "../src";

// 22/10/2026 às 23h30 em Cuiabá = 23/10 03:30 UTC → deve continuar sendo dia 22.
const DATA = new Date("2026-10-23T03:30:00Z");

describe("numeração de propostas", () => {
  it("formata com ponto de milhar", () => {
    expect(formatarNumeroProposta(2206)).toBe("2.206");
    expect(formatarNumeroProposta(2)).toBe("2");
    expect(formatarNumeroProposta(12345)).toBe("12.345");
  });
  it("lê nos dois formatos", () => {
    expect(lerNumeroProposta("2.206")).toBe(2206);
    expect(lerNumeroProposta(" 2206 ")).toBe(2206);
    expect(() => lerNumeroProposta("2,206")).toThrow();
  });
  it("próximo = maior + 1", () => {
    expect(proximoNumeroProposta([2204, 2206, 2205])).toBe(2207);
    expect(proximoNumeroProposta([])).toBe(1);
  });
});

describe("nomes de registro e de arquivo (fuso America/Cuiaba)", () => {
  it("data em Cuiabá", () => {
    expect(formatarData(DATA)).toBe("22/10/2026");
  });
  it("registro: CLIENTE - DD.MM.AA", () => {
    expect(nomeRegistroOrcamento("Construtora  Brasil Infraestrutura LTDA", DATA)).toBe(
      "CONSTRUTORA BRASIL INFRAESTRUTURA LTDA - 22.10.26",
    );
  });
  it("arquivo: PROPOSTA - RAZÃO - NÚMERO - DD.MM.AAAA.pdf", () => {
    expect(nomeArquivoProposta("Construtora Brasil Infraestrutura LTDA", 2206, DATA)).toBe(
      "PROPOSTA - CONSTRUTORA BRASIL INFRAESTRUTURA LTDA - 2.206 - 22.10.2026.pdf",
    );
  });
  it("remove caracteres proibidos em nome de arquivo", () => {
    expect(nomeArquivoProposta("A/B: Comércio", 10, DATA)).toBe("PROPOSTA - A-B- COMÉRCIO - 10 - 22.10.2026.pdf");
  });
});

describe("tubos fabricados", () => {
  it("TFL DN80 ÁGUA, 6000 mm, 2 flanges: (286,1161/1000×6000 + 162,4726×2) × 1,05", () => {
    expect(
      custoTuboFabricado({ custoMetro: 286.1161, comprimentoMm: 6000, custoFlange: 162.4726, qtdFlange: 2, adicional: 0 }),
    ).toBe(2143.72);
  });
  it("TFP DN80 com adicional de R$ 50 e 1 flange, 1500 mm", () => {
    // (286,1161×1,5 + 162,4726 + 50) × 1,05 = 673,729…
    expect(
      custoTuboFabricado({ custoMetro: 286.1161, comprimentoMm: 1500, custoFlange: 162.4726, qtdFlange: 1, adicional: 50 }),
    ).toBe(673.73);
  });
  it("rejeita comprimento zero", () => {
    expect(() =>
      custoTuboFabricado({ custoMetro: 1, comprimentoMm: 0, custoFlange: 0, qtdFlange: 0, adicional: 0 }),
    ).toThrow();
  });
  it("conversões M ↔ MM", () => {
    expect(precoPorMetroParaMm(286.1161)).toBeCloseTo(0.2861161, 10);
    expect(metrosParaMm(5.8)).toBe(5800);
  });
});

describe("unidades", () => {
  it("UN não aceita fração; M e MM aceitam", () => {
    expect(validarQuantidade(2.5, "UN")).not.toBeNull();
    expect(validarQuantidade(2, "UN")).toBeNull();
    expect(validarQuantidade(2.5, "M")).toBeNull();
    expect(validarQuantidade(1250.5, "MM")).toBeNull();
    expect(validarQuantidade(0, "M")).not.toBeNull();
  });
});

describe("regra K7 → K9 (tubo ponta-bolsa DN100)", () => {
  it("troca K7 por K9 no DN100", () => {
    expect(aplicarRegraK7paraK9("TUBO TK7JGS 100 6000")).toEqual({ descricao: "TUBO TK9JGS 100 6000", alterado: true });
  });
  it("não mexe em outros DN nem em K9/K10", () => {
    expect(aplicarRegraK7paraK9("TUBO TK7JGS 150 6000").alterado).toBe(false);
    expect(aplicarRegraK7paraK9("TUBO TK7JGS 1000 7000").alterado).toBe(false);
    expect(aplicarRegraK7paraK9("TUBO TK9JGSAZ 100 6000").alterado).toBe(false);
  });
});

describe("CNPJ", () => {
  it("valida CNPJs reais da proposta", () => {
    expect(validarCnpj("26.475.981/0001-17")).toBe(true);
    expect(validarCnpj("20.775.930/0001-24")).toBe(true);
  });
  it("rejeita dígito errado e repetidos", () => {
    expect(validarCnpj("26.475.981/0001-18")).toBe(false);
    expect(validarCnpj("11.111.111/1111-11")).toBe(false);
  });
  it("formata", () => {
    expect(formatarCnpj("26475981000117")).toBe("26.475.981/0001-17");
  });
});
