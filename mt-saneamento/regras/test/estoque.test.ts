import { describe, expect, it } from "vitest";
import { disponivel, saldoPorMarca, saldoTotal, statusEstoque, type Movimento } from "../src";

describe("saldo por marca (ledger)", () => {
  const movs: Movimento[] = [
    { marca: "PAM", tipo: "INICIAL", quantidade: 10 },
    { marca: "PAM", tipo: "ENTRADA", quantidade: 5 },
    { marca: "PAM", tipo: "SAIDA", quantidade: 3 },
    { marca: "Angolini", tipo: "INICIAL", quantidade: 4 },
    { marca: "Angolini", tipo: "AJUSTE_SAIDA", quantidade: 1 },
    { marca: "PAM", tipo: "TRANSF_SAIDA", quantidade: 2 },
    { marca: "Fanuel", tipo: "TRANSF_ENTRADA", quantidade: 2 },
  ];

  it("saldo = inicial + entradas − saídas, por marca", () => {
    const s = saldoPorMarca(movs);
    expect(s.get("PAM")).toBe(10);
    expect(s.get("Angolini")).toBe(3);
    expect(s.get("Fanuel")).toBe(2);
  });

  it("total = soma das marcas; transferência não altera o total", () => {
    expect(saldoTotal(saldoPorMarca(movs))).toBe(15);
  });

  it("quantidades fracionadas (M/MM) somam sem erro de float", () => {
    const s = saldoPorMarca([
      { marca: "PAM", tipo: "ENTRADA", quantidade: 0.1 },
      { marca: "PAM", tipo: "ENTRADA", quantidade: 0.2 },
    ]);
    expect(s.get("PAM")).toBe(0.3);
  });

  it("saldo negativo aparece (não é escondido)", () => {
    const s = saldoPorMarca([{ marca: "PAM", tipo: "SAIDA", quantidade: 2 }]);
    expect(s.get("PAM")).toBe(-2);
    expect(statusEstoque(-2)).toBe("NEGATIVO");
  });

  it("rejeita quantidade zero ou negativa", () => {
    expect(() => saldoPorMarca([{ marca: "PAM", tipo: "ENTRADA", quantidade: 0 }])).toThrow();
    expect(() => saldoPorMarca([{ marca: "PAM", tipo: "ENTRADA", quantidade: -1 }])).toThrow();
  });
});

describe("status e disponível", () => {
  it("OK / REPOR / ZERADO com mínimo padrão 5", () => {
    expect(statusEstoque(0)).toBe("ZERADO");
    expect(statusEstoque(4)).toBe("REPOR");
    expect(statusEstoque(5)).toBe("OK");
    expect(statusEstoque(8, 10)).toBe("REPOR");
  });
  it("disponível = saldo − reservado", () => {
    expect(disponivel(10, 3)).toBe(7);
    expect(disponivel(2, 3)).toBe(-1);
  });
});
