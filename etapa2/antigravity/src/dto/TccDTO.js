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
    linkLume = '',
    midias = [],
    possuiArquivo = false,
    arquivo = null,
    visualizacoes = 0,
    trabalhosConexos = [],
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
    this.linkLume = linkLume;
    this.midias = midias;
    this.possuiArquivo = possuiArquivo;
    this.arquivo = arquivo;
    this.visualizacoes = visualizacoes;
    this.trabalhosConexos = trabalhosConexos;
  }

  static deEntidade(tcc, { trabalhosConexos = [] } = {}) {
    return new TccDTO({
      id: tcc.id,
      titulo: tcc.titulo,
      resumoSimplificado: tcc.resumoSimplificado,
      ano: tcc.ano,
      semestre: tcc.semestre,
      autor: tcc.autor ? tcc.autor.nome : '',
      orientador: tcc.orientador ? tcc.orientador.nome : '',
      tags: Array.isArray(tcc.tags) ? tcc.tags.map((tag) => tag.nome) : [],
      coorientador: tcc.coorientador ? tcc.coorientador.nome : null,
      linkLume: tcc.linkLume,
      midias: Array.isArray(tcc.midias)
        ? tcc.midias.map((m) => ({
            id: m.id,
            caminhoUrl: m.caminhoUrl,
            descricao: m.descricao,
          }))
        : [],
      possuiArquivo: Boolean(tcc.arquivo),
      arquivo: tcc.arquivo
        ? {
            nomeOriginal: tcc.arquivo.nomeOriginal,
            formato: tcc.arquivo.formato,
            caminho: tcc.arquivo.caminho,
          }
        : null,
      visualizacoes: tcc.visualizacoes,
      trabalhosConexos,
    });
  }
}

