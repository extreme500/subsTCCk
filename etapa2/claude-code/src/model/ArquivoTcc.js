// ArquivoTcc (diagrama de classes; plan D8). Origem: FR-015.
// `caminho` é a chave do conteúdo no ArmazenamentoArquivos.
export class ArquivoTcc {
  constructor({ nomeOriginal, formato, caminho }) {
    this.nomeOriginal = nomeOriginal;
    this.formato = formato;
    this.caminho = caminho;
  }
}
