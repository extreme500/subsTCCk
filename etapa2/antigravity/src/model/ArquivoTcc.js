import { FormatoArquivo } from './FormatoArquivo.js';

export class ArquivoTcc {
  constructor({ nomeOriginal, formato = FormatoArquivo.PDF, caminho, conteudo = '' }) {
    this.nomeOriginal = nomeOriginal;
    this.formato = formato;
    this.caminho = caminho;
    this.conteudo = conteudo;
  }
}

export const ArquivoTCC = ArquivoTcc;

