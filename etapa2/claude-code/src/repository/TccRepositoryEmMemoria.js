import { TccRepository } from './TccRepository.js';
import { normalizarTexto, minusculas } from './normalizacao.js';

// Implementação em memória do TccRepository (constituição V).
export class TccRepositoryEmMemoria extends TccRepository {
  constructor(tccs = []) {
    super();
    this.tccs = new Map();
    for (const tcc of tccs) this.salvarTcc(tcc);
  }

  salvarTcc(tcc) {
    this.tccs.set(tcc.id, tcc);
  }

  buscarPorId(id) {
    return this.tccs.get(id) ?? null;
  }

  /**
   * TCCs de qualquer status que atendem a TODOS os critérios preenchidos (FR-005).
   * A visibilidade (só PUBLICADO) é regra de negócio e fica no TccService.
   * @param {import('../dto/FiltroBusca.js').FiltroBusca} filtros
   */
  buscarPorFiltros(filtros) {
    return [...this.tccs.values()].filter((tcc) => atendeFiltros(tcc, filtros));
  }
}

function atendeFiltros(tcc, filtros) {
  return (
    atendeTermo(tcc, filtros.termo) &&
    atendeAno(tcc, filtros.ano) &&
    contemParcial(tcc.autor?.nome, filtros.autor) &&
    contemParcial(tcc.orientador?.nome, filtros.orientador) &&
    atendeTags(tcc, filtros.tags) &&
    atendeColecao(tcc, filtros.colecao)
  );
}

// FR-004: termo em título, resumo, autor, orientador ou tags; parcial, sem caixa e sem acentos.
function atendeTermo(tcc, termo) {
  if (termo === null || termo === undefined) return true;
  const procurado = normalizarTexto(termo);
  const campos = [
    tcc.titulo,
    tcc.resumoSimplificado,
    tcc.autor?.nome,
    tcc.orientador?.nome,
    ...tcc.tags.map((tag) => tag.nome),
  ];
  return campos.some((campo) => normalizarTexto(campo).includes(procurado));
}

// FR-006: qualquer semestre do ano informado.
function atendeAno(tcc, ano) {
  if (ano === null || ano === undefined) return true;
  return tcc.ano === ano;
}

// FR-007: parte do nome, sem diferenciar maiúsculas/minúsculas.
function contemParcial(nome, valor) {
  if (valor === null || valor === undefined) return true;
  if (!nome) return false;
  return minusculas(nome).includes(minusculas(valor));
}

// FR-008: o TCC precisa ter todas as tags selecionadas (E), comparadas pelo nome inteiro.
function atendeTags(tcc, tags) {
  if (!tags || tags.length === 0) return true;
  const nomesDoTcc = tcc.tags.map((tag) => normalizarTexto(tag.nome));
  return tags.every((tag) => nomesDoTcc.includes(normalizarTexto(tag)));
}

// FR-003a: coleção = curso de origem; TCC sem coleção não atende (premissa da spec).
function atendeColecao(tcc, colecao) {
  if (colecao === null || colecao === undefined) return true;
  if (!tcc.colecao) return false;
  return normalizarTexto(tcc.colecao) === normalizarTexto(colecao);
}
