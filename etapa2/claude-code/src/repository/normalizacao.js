// Funções puras de comparação de texto usadas na busca.

/**
 * Para o termo livre, tags e coleção: ignora maiúsculas/minúsculas e acentos.
 * Origem: FR-004 (Esclarecimentos P2), FR-003a, FR-008.
 */
export function normalizarTexto(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

/**
 * Para os filtros de autor e orientador: ignora só maiúsculas/minúsculas.
 * Origem: FR-007 (plan, Decisões técnicas).
 */
export function minusculas(texto) {
  return String(texto ?? '').toLocaleLowerCase('pt-BR').trim();
}
