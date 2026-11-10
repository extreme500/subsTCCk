// TccDTO (diagrama de classes), com `tags` como lista e campos de detalhe
// acrescentados (plan D4). Sempre cria objetos novos: o controller nunca expõe o modelo.
// Origem: FR-002, FR-010, FR-013, FR-015a.
export class TccDTO {
  constructor({
    id,
    titulo,
    resumoSimplificado,
    ano,
    semestre,
    autor,
    orientador,
    tags = [],
    coorientador = null,
    colecao = null,
    linkLume = null,
    imagens = [],
    arquivoDisponivel = false,
    formatoArquivo = null,
  }) {
    this.id = id;
    this.titulo = titulo;
    this.resumoSimplificado = resumoSimplificado;
    this.ano = ano;
    this.semestre = semestre;
    this.autor = autor;
    this.orientador = orientador;
    this.tags = tags;
    this.coorientador = coorientador;
    this.colecao = colecao;
    this.linkLume = linkLume;
    this.imagens = imagens;
    this.arquivoDisponivel = arquivoDisponivel;
    this.formatoArquivo = formatoArquivo;
  }

  /** @param {import('../model/TCC.js').TCC} tcc */
  static deTcc(tcc) {
    return new TccDTO({
      id: tcc.id,
      titulo: tcc.titulo,
      resumoSimplificado: tcc.resumoSimplificado,
      ano: tcc.ano,
      semestre: tcc.semestre,
      autor: tcc.autor?.nome ?? null,
      orientador: tcc.orientador?.nome ?? null,
      tags: tcc.tags.map((tag) => tag.nome),
      coorientador: tcc.coorientador?.nome ?? null,
      colecao: tcc.colecao ?? null,
      linkLume: tcc.linkLume,
      imagens: tcc.midias.map((m) => ({ caminhoUrl: m.caminhoUrl, descricao: m.descricao })),
      arquivoDisponivel: tcc.arquivo !== null && tcc.arquivo !== undefined,
      formatoArquivo: tcc.arquivo?.formato ?? null,
    });
  }
}
