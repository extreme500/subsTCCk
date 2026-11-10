// «interface» ArmazenamentoArquivos: raia "Armazenamento de Arquivos" do diagrama de
// atividades do UC04 (plan D7; constituição IV). Origem: FR-015, FR-016.

/** Falha durante a transferência (ex.: conexão interrompida). */
export class FalhaTransferenciaError extends Error {
  constructor(mensagem = 'Falha na transferência do arquivo') {
    super(mensagem);
    this.name = 'FalhaTransferenciaError';
  }
}

export class ArmazenamentoArquivos {
  /**
   * Transfere o conteúdo do arquivo em blocos. Lança FalhaTransferenciaError durante a
   * iteração se a transferência falhar.
   * @param {string} caminho
   * @returns {AsyncIterable<Uint8Array>}
   */
  transferir(caminho) { // eslint-disable-line no-unused-vars
    throw new Error('não implementado');
  }
}
