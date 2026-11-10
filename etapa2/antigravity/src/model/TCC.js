import { StatusTcc } from './StatusTcc.js';

export class TCC {
  constructor({
    id,
    titulo,
    resumoSimplificado,
    ano,
    semestre,
    linkLume = '',
    status = StatusTcc.RASCUNHO,
    visualizacoes = 0,
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
    this.autor = autor;
    this.orientador = orientador;
    this.coorientador = coorientador;
    this.tags = tags;
    this.midias = midias;
    this.arquivo = arquivo;
  }

  publicar() {
    this.status = StatusTcc.PUBLICADO;
  }

  salvarRascunho() {
    this.status = StatusTcc.RASCUNHO;
  }

  validarCamposObrigatorios() {
    const possuiTexto = (valor) => typeof valor === 'string' && valor.trim().length > 0;
    const possuiTagsValidas = Array.isArray(this.tags) && this.tags.length >= 1 && this.tags.length <= 5;
    const possuiMidiasValidas = Array.isArray(this.midias) && this.midias.length <= 3;

    return Boolean(
      possuiTexto(this.titulo) &&
        possuiTexto(this.resumoSimplificado) &&
        Number.isInteger(this.ano) &&
        Number.isInteger(this.semestre) &&
        this.autor &&
        this.orientador &&
        possuiTagsValidas &&
        possuiMidiasValidas
    );
  }

  registrarVisualizacao() {
    this.visualizacoes += 1;
  }
}

