/** Remove tudo que não for dígito. */
export function soDigitos(texto: string): string {
  return texto.replace(/\D/g, "");
}

/** Valida CNPJ pelos dígitos verificadores. */
export function validarCnpj(cnpj: string): boolean {
  const d = soDigitos(cnpj);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (base: string, pesos: number[]) => {
    const soma = pesos.reduce((s, p, i) => s + Number(base[i]) * p, 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const p2 = [6, ...p1];
  const dv1 = calc(d, p1);
  const dv2 = calc(d, p2);
  return dv1 === Number(d[12]) && dv2 === Number(d[13]);
}

/** "26475981000117" → "26.475.981/0001-17". */
export function formatarCnpj(cnpj: string): string {
  const d = soDigitos(cnpj);
  if (d.length !== 14) return cnpj;
  return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}
