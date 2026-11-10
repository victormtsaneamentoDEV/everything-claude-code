import { partesDataCuiaba } from "./datas";
import { formatarNumeroProposta } from "./numeracao";

function maiusculas(texto: string): string {
  return texto.trim().replace(/\s+/g, " ").toLocaleUpperCase("pt-BR");
}

/** Caracteres proibidos em nome de arquivo no Windows/macOS. */
function limparParaArquivo(texto: string): string {
  return texto.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
}

/** Nome do registro do orçamento: "CLIENTE - DD.MM.AA". */
export function nomeRegistroOrcamento(cliente: string, data: Date): string {
  const { dia, mes, ano } = partesDataCuiaba(data);
  return `${maiusculas(cliente)} - ${dia}.${mes}.${ano.slice(-2)}`;
}

/** Nome do PDF: "PROPOSTA - RAZÃO SOCIAL - 2.206 - DD.MM.AAAA.pdf". */
export function nomeArquivoProposta(razaoSocial: string, numero: number, data: Date): string {
  const { dia, mes, ano } = partesDataCuiaba(data);
  const razao = limparParaArquivo(maiusculas(razaoSocial));
  return `PROPOSTA - ${razao} - ${formatarNumeroProposta(numero)} - ${dia}.${mes}.${ano}.pdf`;
}
