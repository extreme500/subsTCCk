import { ArmazenamentoArquivos, FalhaTransferenciaError } from './ArmazenamentoArquivos.js';

// Armazenamento de arquivos em memória; entrega o conteúdo em blocos. Origem: FR-015.
export class ArmazenamentoArquivosEmMemoria extends ArmazenamentoArquivos {
  constructor(arquivos = new Map(), { tamanhoBloco = 16 } = {}) {
    super();
    this.arquivos = new Map(arquivos);
    this.tamanhoBloco = tamanhoBloco;
  }

  adicionar(caminho, conteudo) {
    this.arquivos.set(caminho, Uint8Array.from(conteudo));
  }

  async *transferir(caminho) {
    const conteudo = this.arquivos.get(caminho);
    if (!conteudo) {
      throw new FalhaTransferenciaError(`Arquivo não encontrado no armazenamento: ${caminho}`);
    }
    for (let inicio = 0; inicio < conteudo.length; inicio += this.tamanhoBloco) {
      yield conteudo.slice(inicio, inicio + this.tamanhoBloco);
    }
  }
}
