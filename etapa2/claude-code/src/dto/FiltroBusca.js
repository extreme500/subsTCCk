// FiltroBusca (diagrama de classes), com `colecao` acrescentada (plan D1) e
// `tags` como lista (plan D3). Todos os critérios são opcionais.
// Origem: FR-003, FR-003a, FR-008, FR-011.

/** Critério de busca inválido (ex.: ano que não é inteiro). */
export class FiltroInvalidoError extends Error {
  constructor(mensagem) {
    super(mensagem);
    this.name = 'FiltroInvalidoError';
  }
}

function textoOuNulo(valor) {
  if (valor === undefined || valor === null) return null;
  const texto = String(valor).trim();
  return texto === '' ? null : texto;
}

function anoOuNulo(valor) {
  if (valor === undefined || valor === null) return null;
  if (typeof valor === 'string' && valor.trim() === '') return null;
  const ano = typeof valor === 'string' ? Number(valor.trim()) : valor;
  if (!Number.isInteger(ano)) {
    throw new FiltroInvalidoError(`Ano inválido: ${valor}`);
  }
  return ano;
}

function listaDeTags(valor) {
  if (valor === undefined || valor === null) return [];
  const lista = Array.isArray(valor) ? valor : [valor];
  const tags = [];
  for (const item of lista) {
    const tag = textoOuNulo(item);
    if (tag !== null && !tags.includes(tag)) tags.push(tag);
  }
  return tags;
}

export class FiltroBusca {
  constructor({ termo, ano, autor, orientador, tags, colecao } = {}) {
    this.termo = textoOuNulo(termo);
    this.ano = anoOuNulo(ano);
    this.autor = textoOuNulo(autor);
    this.orientador = textoOuNulo(orientador);
    this.tags = listaDeTags(tags);
    this.colecao = textoOuNulo(colecao);
  }
}
