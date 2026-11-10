export const FUSO = "America/Cuiaba";

/** Dia, mês e ano no fuso de Cuiabá. */
export function partesDataCuiaba(data: Date): { dia: string; mes: string; ano: string } {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(data);
  const get = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
  return { dia: get("day"), mes: get("month"), ano: get("year") };
}

/** "DD/MM/AAAA" no fuso de Cuiabá. */
export function formatarData(data: Date): string {
  const { dia, mes, ano } = partesDataCuiaba(data);
  return `${dia}/${mes}/${ano}`;
}
