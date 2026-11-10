import { StatusTcc } from './StatusTcc.js';

// TCC (diagrama de classes), com `colecao` acrescentada (plan D2, Esclarecimentos P1)
// e orientador/coorientador como papéis da associação 1..2 com Professor (plan D10).
// Métodos de cadastro, rascunho e visualização não fazem parte desta funcionalidade (plan D9).
// Origem: FR-003a, FR-013, FR-015a.
export class TCC {
  constructor({
    id,
    titulo,
    resumoSimplificado,
    ano,
    semestre,
    linkLume,
    status = StatusTcc.RASCUNHO,
    visualizacoes = 0,
    colecao = null,
    autor,
    orientador,
    coorientador = null,
    tags = [],
    midias = [],
    arquivo = null,
  }) {
    this.id = id;
    this.titulo = titulo;
    this.resumoSimplificado = resumoSimplificado;
    this.ano = ano;
    this.semestre = semestre;
    this.linkLume = linkLume;
    this.status = status;
    this.visualizacoes = visualizacoes;
    this.colecao = colecao;
    this.autor = autor;
    this.orientador = orientador;
    this.coorientador = coorientador;
    this.tags = tags;
    this.midias = midias;
    this.arquivo = arquivo;
  }
}
